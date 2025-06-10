
-- FASE 1: CONFIGURAR JWT CLAIMS E RLS COMPLETO PARA ISOLAMENTO MULTI-TENANT

-- 1.1: Função para buscar company_id do usuário (SECURITY INVOKER para respeitar RLS)
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_company_id uuid;
BEGIN
    SELECT company_id INTO user_company_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
    
    RETURN user_company_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- 1.2: Atualizar função de custom claims para incluir company_id no JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_company_id uuid;
  user_role text;
BEGIN
  -- Buscar company_id e role do usuário
  SELECT company_id, role::text INTO user_company_id, user_role
  FROM public.profiles 
  WHERE id = (event->>'user_id')::uuid;
  
  claims := event->'claims';
  
  -- Adicionar company_id e role ao JWT
  IF user_company_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{company_id}', to_jsonb(user_company_id::text));
  END IF;
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  END IF;
  
  -- Retornar event com claims atualizadas
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- 1.3: Dropar políticas antigas problemáticas
DROP POLICY IF EXISTS "company_transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "company_transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "company_transactions_update" ON public.transactions;
DROP POLICY IF EXISTS "company_transactions_delete" ON public.transactions;

DROP POLICY IF EXISTS "company_payments_select" ON public.payments;
DROP POLICY IF EXISTS "company_payments_insert" ON public.payments;
DROP POLICY IF EXISTS "company_payments_update" ON public.payments;
DROP POLICY IF EXISTS "company_payments_delete" ON public.payments;

DROP POLICY IF EXISTS "company_providers_select" ON public.service_providers;
DROP POLICY IF EXISTS "company_providers_insert" ON public.service_providers;
DROP POLICY IF EXISTS "company_providers_update" ON public.service_providers;

DROP POLICY IF EXISTS "company_clients_select" ON public.clients;
DROP POLICY IF EXISTS "company_clients_insert" ON public.clients;
DROP POLICY IF EXISTS "company_clients_update" ON public.clients;

-- 1.4: Garantir que RLS está ativo em todas as tabelas
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmed_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.5: Criar políticas RLS baseadas em JWT claims

-- TRANSACTIONS
CREATE POLICY "jwt_company_transactions_select" 
ON public.transactions FOR SELECT 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_transactions_insert" 
ON public.transactions FOR INSERT 
WITH CHECK (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_transactions_update" 
ON public.transactions FOR UPDATE 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_transactions_delete" 
ON public.transactions FOR DELETE 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- PAYMENTS
CREATE POLICY "jwt_company_payments_select" 
ON public.payments FOR SELECT 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_payments_insert" 
ON public.payments FOR INSERT 
WITH CHECK (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_payments_update" 
ON public.payments FOR UPDATE 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_payments_delete" 
ON public.payments FOR DELETE 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- SERVICE_PROVIDERS
CREATE POLICY "jwt_company_providers_select" 
ON public.service_providers FOR SELECT 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_providers_insert" 
ON public.service_providers FOR INSERT 
WITH CHECK (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_providers_update" 
ON public.service_providers FOR UPDATE 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- CLIENTS
CREATE POLICY "jwt_company_clients_select" 
ON public.clients FOR SELECT 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_clients_insert" 
ON public.clients FOR INSERT 
WITH CHECK (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "jwt_company_clients_update" 
ON public.clients FOR UPDATE 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- EXPENSES (isolamento via missions)
CREATE POLICY "jwt_company_expenses_select" 
ON public.expenses FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.missions m 
  JOIN public.profiles p ON m.created_by = p.id 
  WHERE m.id = expenses.mission_id 
  AND p.company_id = (auth.jwt() ->> 'company_id')::uuid
));

CREATE POLICY "jwt_company_expenses_insert" 
ON public.expenses FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.missions m 
  JOIN public.profiles p ON m.created_by = p.id 
  WHERE m.id = expenses.mission_id 
  AND p.company_id = (auth.jwt() ->> 'company_id')::uuid
));

-- MISSIONS (isolamento via created_by)
CREATE POLICY "jwt_company_missions_select" 
ON public.missions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = missions.created_by 
  AND p.company_id = (auth.jwt() ->> 'company_id')::uuid
));

CREATE POLICY "jwt_company_missions_insert" 
ON public.missions FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() 
  AND p.company_id = (auth.jwt() ->> 'company_id')::uuid
));

-- PENDING_REVENUES (isolamento via missions)
CREATE POLICY "jwt_company_pending_revenues_select" 
ON public.pending_revenues FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.missions m 
  JOIN public.profiles p ON m.created_by = p.id 
  WHERE m.id = pending_revenues.mission_id 
  AND p.company_id = (auth.jwt() ->> 'company_id')::uuid
));

-- CONFIRMED_REVENUES (isolamento via missions)
CREATE POLICY "jwt_company_confirmed_revenues_select" 
ON public.confirmed_revenues FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.missions m 
  JOIN public.profiles p ON m.created_by = p.id 
  WHERE m.id = confirmed_revenues.mission_id 
  AND p.company_id = (auth.jwt() ->> 'company_id')::uuid
));

-- PROFILES (usuários podem ver apenas perfis da própria empresa)
CREATE POLICY "jwt_company_profiles_select" 
ON public.profiles FOR SELECT 
USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- 1.6: Atualizar função insert_transaction_with_casting para usar JWT
CREATE OR REPLACE FUNCTION public.insert_transaction_with_casting(p_type text, p_category text, p_amount numeric, p_description text, p_date date, p_method text, p_status text, p_user_id uuid, p_user_name text, p_mission_id uuid DEFAULT NULL::uuid, p_receipt text DEFAULT NULL::text, p_tags text[] DEFAULT NULL::text[], p_account_id uuid DEFAULT NULL::uuid, p_account_type text DEFAULT NULL::text)
RETURNS TABLE(id uuid, type text, category text, amount numeric, description text, date date, method text, status text, user_id uuid, user_name text, receipt text, tags text[], mission_id uuid, account_id uuid, account_type text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_transaction_id UUID;
  user_company_id UUID;
BEGIN
  -- Buscar company_id do JWT
  user_company_id := (auth.jwt() ->> 'company_id')::uuid;
  
  -- Validar que o usuário tem company_id
  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não possui empresa associada no token JWT';
  END IF;
  
  -- Inserir com company_id do JWT
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

-- 1.7: Função para ativar custom claims hook (deve ser configurada no Supabase Dashboard)
-- NOTA: Esta configuração deve ser feita no Dashboard do Supabase em:
-- Authentication > Hooks > Custom Access Token Hook
-- URL: https://ushqcekjondadeqwieke.supabase.co/rest/v1/rpc/custom_access_token_hook

-- Log de sucesso
DO $$
BEGIN
  RAISE LOG 'RLS MULTI-TENANT CONFIGURADO: Isolamento completo baseado em JWT claims implementado';
END $$;
