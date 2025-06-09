
-- Criar função para registrar transações baseadas no status da missão
CREATE OR REPLACE FUNCTION public.handle_mission_status_financial_impact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  transaction_result RECORD;
BEGIN
  -- Só processar se o status mudou e a missão tem valor de serviço
  IF NEW.status != OLD.status AND NEW.service_value > 0 THEN
    
    CASE NEW.status
      -- No Show Cliente: valor mantido como receita (entrada)
      WHEN 'no-show-client' THEN
        SELECT * INTO transaction_result FROM public.insert_transaction_with_casting(
          p_type := 'income',
          p_category := 'client_payment',
          p_amount := NEW.service_value,
          p_description := 'No Show Cliente - Receita mantida: ' || NEW.title,
          p_date := CURRENT_DATE,
          p_method := 'transfer',
          p_status := 'completed',
          p_user_id := auth.uid(),
          p_user_name := COALESCE(
            (SELECT name FROM public.profiles WHERE id = auth.uid()),
            'Sistema'
          ),
          p_mission_id := NEW.id
        );
        
        RAISE LOG 'Transação de receita criada para No Show Cliente - Missão: %, Valor: %', NEW.id, NEW.service_value;
      
      -- No Show Técnico: valor registrado como saída  
      WHEN 'no-show-technician' THEN
        SELECT * INTO transaction_result FROM public.insert_transaction_with_casting(
          p_type := 'expense',
          p_category := 'service_payment',
          p_amount := NEW.service_value,
          p_description := 'No Show Técnico - Valor registrado como saída: ' || NEW.title,
          p_date := CURRENT_DATE,
          p_method := 'transfer',
          p_status := 'completed',
          p_user_id := auth.uid(),
          p_user_name := COALESCE(
            (SELECT name FROM public.profiles WHERE id = auth.uid()),
            'Sistema'
          ),
          p_mission_id := NEW.id
        );
        
        RAISE LOG 'Transação de despesa criada para No Show Técnico - Missão: %, Valor: %', NEW.id, NEW.service_value;
      
      -- Missão Concluída: criar receita pendente (como já existe)
      WHEN 'completed' THEN
        -- Verificar se já existe receita pendente para esta missão
        IF NOT EXISTS (SELECT 1 FROM public.pending_revenues WHERE mission_id = NEW.id) THEN
          INSERT INTO public.pending_revenues (
            mission_id,
            client_name,
            total_amount,
            company_amount,
            provider_amount,
            due_date,
            description
          ) VALUES (
            NEW.id,
            COALESCE(NEW.client_name, 'Cliente não especificado'),
            NEW.service_value,
            NEW.company_value,
            NEW.provider_value,
            COALESCE(NEW.end_date, NEW.start_date + INTERVAL '30 days'),
            'Receita pendente da missão concluída: ' || NEW.title
          );
          
          RAISE LOG 'Receita pendente criada para missão concluída: %, Valor: %', NEW.id, NEW.service_value;
        END IF;
        
      ELSE
        -- Para outros status (planning, in-progress, pending) não fazer nada
        RAISE LOG 'Status alterado para % - nenhuma ação financeira necessária', NEW.status;
    END CASE;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar trigger para executar a função quando o status da missão mudar
DROP TRIGGER IF EXISTS mission_status_financial_impact_trigger ON public.missions;

CREATE TRIGGER mission_status_financial_impact_trigger
  AFTER UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mission_status_financial_impact();

-- Log da criação
SELECT 'Trigger de impacto financeiro do status da missão criado com sucesso' as result;
