
CREATE OR REPLACE FUNCTION public.convert_pending_to_confirmed_revenue(
  pending_revenue_id uuid, 
  account_id uuid, 
  account_type text, 
  payment_method text DEFAULT 'transfer'::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  pending_record RECORD;
  transaction_result RECORD;
  confirmed_revenue_id UUID;
BEGIN
  -- Buscar receita pendente
  SELECT * INTO pending_record 
  FROM public.pending_revenues 
  WHERE id = pending_revenue_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Receita pendente não encontrada');
  END IF;
  
  -- Criar transação de receita usando o VALOR TOTAL da missão
  SELECT * INTO transaction_result FROM public.insert_transaction_with_casting(
    p_type := 'income',
    p_category := 'client_payment',
    p_amount := pending_record.total_amount,
    p_description := 'Recebimento confirmado: ' || pending_record.description,
    p_date := CURRENT_DATE,
    p_method := payment_method,
    p_status := 'completed',
    p_user_id := auth.uid(),
    p_user_name := COALESCE(
      (SELECT name FROM public.profiles WHERE id = auth.uid()),
      'Sistema'
    ),
    p_mission_id := pending_record.mission_id,
    p_account_id := convert_pending_to_confirmed_revenue.account_id,
    p_account_type := convert_pending_to_confirmed_revenue.account_type
  );
  
  -- Criar receita confirmada
  INSERT INTO public.confirmed_revenues (
    mission_id,
    client_name,
    total_amount,
    company_amount,
    provider_amount,
    received_date,
    payment_method,
    description,
    account_id,
    account_type,
    transaction_id
  ) VALUES (
    pending_record.mission_id,
    pending_record.client_name,
    pending_record.total_amount,
    pending_record.company_amount,
    pending_record.provider_amount,
    CURRENT_DATE,
    payment_method,
    pending_record.description,
    convert_pending_to_confirmed_revenue.account_id,
    convert_pending_to_confirmed_revenue.account_type,
    transaction_result.id
  ) RETURNING id INTO confirmed_revenue_id;
  
  -- Atualizar receita pendente para recebida
  UPDATE public.pending_revenues 
  SET 
    status = 'received',
    received_at = now(),
    account_id = convert_pending_to_confirmed_revenue.account_id,
    account_type = convert_pending_to_confirmed_revenue.account_type
  WHERE id = pending_revenue_id;
  
  -- Log da operação
  RAISE LOG 'Receita de % convertida para confirmada (ID: %)', pending_record.total_amount, confirmed_revenue_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Receita convertida e confirmada com sucesso',
    'transaction_id', transaction_result.id,
    'confirmed_revenue_id', confirmed_revenue_id,
    'total_amount', pending_record.total_amount
  );
END;
$function$
