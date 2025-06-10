
-- Fix Function Search Path Mutable security warnings
-- This migration adds proper search_path settings to all functions for security

-- 1. Fix get_cash_flow_projections (most critical - already updated)
CREATE OR REPLACE FUNCTION public.get_cash_flow_projections()
RETURNS TABLE(
  month timestamp with time zone,
  type text,
  amount numeric,
  description text
)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  user_company_id uuid;
BEGIN
  -- Get the user's company_id
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Return cash flow data filtered by company
  RETURN QUERY
  SELECT 
    date_trunc('month', p.due_date)::timestamp with time zone as month,
    'payment'::text as type,
    p.amount,
    'Pagamento programado: ' || p.description as description
  FROM public.payments p
  WHERE p.company_id = user_company_id
    AND p.status = 'pending'
    AND p.due_date >= CURRENT_DATE
  
  UNION ALL
  
  SELECT 
    date_trunc('month', pr.due_date)::timestamp with time zone as month,
    'income'::text as type,
    pr.total_amount,
    'Receita esperada: ' || pr.description as description
  FROM public.pending_revenues pr
  JOIN public.missions m ON pr.mission_id = m.id
  WHERE m.created_by IN (
    SELECT id FROM public.profiles WHERE company_id = user_company_id
  )
    AND pr.status = 'pending'
    AND pr.due_date >= CURRENT_DATE
  
  ORDER BY month;
END;
$$;

-- 2. Fix is_company_owner function
CREATE OR REPLACE FUNCTION public.is_company_owner()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR user_type = 'admin')
  );
END;
$$;

-- 3. Fix get_user_transactions_simple function
CREATE OR REPLACE FUNCTION public.get_user_transactions_simple()
RETURNS TABLE(id uuid, type text, category text, amount numeric, description text, date date, method text, status text, user_id uuid, user_name text, receipt text, tags text[], mission_id uuid, account_id uuid, account_type text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se é dono da empresa, buscar todas as transações
  IF public.is_company_owner() THEN
    RETURN QUERY
    SELECT 
      t.id, t.type, t.category::TEXT, t.amount, t.description, t.date,
      t.method::TEXT, t.status::TEXT, t.user_id, t.user_name, t.receipt,
      t.tags, t.mission_id, t.account_id, t.account_type, t.created_at, t.updated_at
    FROM public.transactions t
    ORDER BY t.created_at DESC;
  ELSE
    -- Se é prestador, buscar apenas suas próprias transações
    RETURN QUERY
    SELECT 
      t.id, t.type, t.category::TEXT, t.amount, t.description, t.date,
      t.method::TEXT, t.status::TEXT, t.user_id, t.user_name, t.receipt,
      t.tags, t.mission_id, t.account_id, t.account_type, t.created_at, t.updated_at
    FROM public.transactions t
    WHERE t.user_id = auth.uid()
    OR public.is_linked_provider(t.user_id)
    ORDER BY t.created_at DESC;
  END IF;
END;
$$;

-- 4. Fix insert_transaction_with_casting function
CREATE OR REPLACE FUNCTION public.insert_transaction_with_casting(p_type text, p_category text, p_amount numeric, p_description text, p_date date, p_method text, p_status text, p_user_id uuid, p_user_name text, p_mission_id uuid DEFAULT NULL::uuid, p_receipt text DEFAULT NULL::text, p_tags text[] DEFAULT NULL::text[], p_account_id uuid DEFAULT NULL::uuid, p_account_type text DEFAULT NULL::text)
RETURNS TABLE(id uuid, type text, category text, amount numeric, description text, date date, method text, status text, user_id uuid, user_name text, receipt text, tags text[], mission_id uuid, account_id uuid, account_type text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_transaction_id UUID;
  user_company_id UUID;
BEGIN
  -- Log dos parâmetros recebidos
  RAISE LOG 'RPC insert_transaction - Status: %, Category: %, Method: %', p_status, p_category, p_method;
  
  -- Get user's company_id for security
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Inserir com casting explícito correto
  INSERT INTO public.transactions (
    type,
    category,
    amount,
    description,
    date,
    method,
    status,
    user_id,
    user_name,
    mission_id,
    receipt,
    tags,
    account_id,
    account_type,
    company_id
  ) VALUES (
    p_type,
    p_category::transaction_category,
    p_amount,
    p_description,
    p_date,
    p_method::payment_method,
    p_status::transaction_status,
    p_user_id,
    p_user_name,
    p_mission_id,
    p_receipt,
    p_tags,
    p_account_id,
    p_account_type,
    user_company_id
  )
  RETURNING transactions.id INTO new_transaction_id;

  RAISE LOG 'Transação inserida com ID: %', new_transaction_id;

  -- Retornar o registro inserido
  RETURN QUERY
  SELECT 
    t.id,
    t.type,
    t.category::text,
    t.amount,
    t.description,
    t.date,
    t.method::text,
    t.status::text,
    t.user_id,
    t.user_name,
    t.receipt,
    t.tags,
    t.mission_id,
    t.account_id,
    t.account_type,
    t.created_at,
    t.updated_at
  FROM public.transactions t
  WHERE t.id = new_transaction_id;
END;
$$;

-- 5. Fix admin functions with proper search path
CREATE OR REPLACE FUNCTION public.admin_find_service_provider_access(search_email text, search_code text)
RETURNS TABLE(id uuid, provider_id uuid, email text, password_hash text, access_code text, is_active boolean, created_at timestamp with time zone, last_login timestamp with time zone, permissions jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    spa.id,
    spa.provider_id,
    spa.email,
    spa.password_hash,
    spa.access_code,
    spa.is_active,
    spa.created_at,
    spa.last_login,
    spa.permissions
  FROM public.service_provider_access spa
  WHERE spa.email = search_email 
    AND spa.access_code = search_code
    AND spa.is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_find_employee_access(search_email text, search_code text)
RETURNS TABLE(id uuid, code text, company_id uuid, employee_name text, employee_email text, is_used boolean, created_at timestamp with time zone, expires_at timestamp with time zone, used_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eac.id,
    eac.code,
    eac.company_id,
    eac.employee_name,
    eac.employee_email,
    eac.is_used,
    eac.created_at,
    eac.expires_at,
    eac.used_at
  FROM public.employee_access_codes eac
  WHERE eac.employee_email = search_email 
    AND eac.code = search_code
    AND eac.is_used = false
    AND (eac.expires_at IS NULL OR eac.expires_at > now());
END;
$$;

-- 6. Fix critical payment and revenue functions
CREATE OR REPLACE FUNCTION public.update_payment_safe(payment_id uuid, payment_updates jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payment_exists BOOLEAN;
  result_record RECORD;
BEGIN
  -- Verificar se o pagamento existe
  SELECT EXISTS(SELECT 1 FROM public.payments WHERE id = payment_id) INTO payment_exists;
  
  IF NOT payment_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado',
      'message', 'O pagamento com ID ' || payment_id || ' não existe na base de dados'
    );
  END IF;
  
  -- Atualizar o pagamento
  UPDATE public.payments 
  SET 
    status = COALESCE((payment_updates->>'status')::payment_status, status),
    payment_date = COALESCE((payment_updates->>'payment_date')::date, payment_date),
    account_id = COALESCE((payment_updates->>'account_id')::uuid, account_id),
    account_type = COALESCE(payment_updates->>'account_type', account_type),
    notes = COALESCE(payment_updates->>'notes', notes),
    amount = COALESCE((payment_updates->>'amount')::numeric, amount),
    due_date = COALESCE((payment_updates->>'due_date')::date, due_date),
    description = COALESCE(payment_updates->>'description', description),
    updated_at = now()
  WHERE id = payment_id
  RETURNING * INTO result_record;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Pagamento atualizado com sucesso',
    'payment', row_to_json(result_record)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro interno',
      'message', SQLERRM
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_payment_by_id(payment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  payment_record RECORD;
BEGIN
  SELECT * INTO payment_record
  FROM public.payments p
  LEFT JOIN public.service_providers sp ON p.provider_id = sp.id
  WHERE p.id = payment_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pagamento não encontrado',
      'message', 'O pagamento com ID ' || payment_id || ' não existe'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'payment', row_to_json(payment_record)
  );
END;
$$;

-- 7. Fix convert_pending_to_confirmed_revenue function
CREATE OR REPLACE FUNCTION public.convert_pending_to_confirmed_revenue(pending_revenue_id uuid, account_id uuid, account_type text, payment_method text DEFAULT 'transfer'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Log da operação
SELECT 'Search path security warnings fixed for critical functions' as result;
