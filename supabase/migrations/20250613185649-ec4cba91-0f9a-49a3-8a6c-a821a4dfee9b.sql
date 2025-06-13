
-- CORREÇÃO COMPLETA DO ISOLAMENTO ENTRE EMPRESAS
-- Esta migração implementa todas as medidas necessárias

-- ========================================
-- FASE 1: ADICIONAR COMPANY_ID EM TABELAS QUE NÃO TÊM
-- ========================================

-- Adicionar company_id em expenses (isolamento via missions)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS company_id uuid;

-- Adicionar company_id em missions  
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS company_id uuid;

-- Adicionar company_id em pending_revenues
ALTER TABLE public.pending_revenues ADD COLUMN IF NOT EXISTS company_id uuid;

-- Adicionar company_id em confirmed_revenues
ALTER TABLE public.confirmed_revenues ADD COLUMN IF NOT EXISTS company_id uuid;

-- ========================================
-- FASE 2: POPULAR COMPANY_ID NAS TABELAS
-- ========================================

-- Atualizar missions com company_id do criador
UPDATE public.missions 
SET company_id = (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = missions.created_by
)
WHERE company_id IS NULL AND created_by IS NOT NULL;

-- Atualizar expenses com company_id via missions
UPDATE public.expenses 
SET company_id = (
    SELECT m.company_id
    FROM public.missions m
    WHERE m.id = expenses.mission_id
)
WHERE company_id IS NULL AND mission_id IS NOT NULL;

-- Atualizar pending_revenues com company_id via missions
UPDATE public.pending_revenues 
SET company_id = (
    SELECT m.company_id
    FROM public.missions m
    WHERE m.id = pending_revenues.mission_id
)
WHERE company_id IS NULL AND mission_id IS NOT NULL;

-- Atualizar confirmed_revenues com company_id via missions
UPDATE public.confirmed_revenues 
SET company_id = (
    SELECT m.company_id
    FROM public.missions m
    WHERE m.id = confirmed_revenues.mission_id
)
WHERE company_id IS NULL AND mission_id IS NOT NULL;

-- ========================================
-- FASE 3: DROPAR TODAS AS POLÍTICAS RLS EXISTENTES
-- ========================================

-- Transactions
DROP POLICY IF EXISTS "jwt_company_transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "jwt_company_transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "jwt_company_transactions_update" ON public.transactions;
DROP POLICY IF EXISTS "jwt_company_transactions_delete" ON public.transactions;

-- Payments
DROP POLICY IF EXISTS "jwt_company_payments_select" ON public.payments;
DROP POLICY IF EXISTS "jwt_company_payments_insert" ON public.payments;
DROP POLICY IF EXISTS "jwt_company_payments_update" ON public.payments;
DROP POLICY IF EXISTS "jwt_company_payments_delete" ON public.payments;

-- Expenses
DROP POLICY IF EXISTS "jwt_company_expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "jwt_company_expenses_insert" ON public.expenses;

-- Missions
DROP POLICY IF EXISTS "jwt_company_missions_select" ON public.missions;
DROP POLICY IF EXISTS "jwt_company_missions_insert" ON public.missions;

-- Service Providers
DROP POLICY IF EXISTS "jwt_company_providers_select" ON public.service_providers;
DROP POLICY IF EXISTS "jwt_company_providers_insert" ON public.service_providers;
DROP POLICY IF EXISTS "jwt_company_providers_update" ON public.service_providers;

-- Clients
DROP POLICY IF EXISTS "jwt_company_clients_select" ON public.clients;
DROP POLICY IF EXISTS "jwt_company_clients_insert" ON public.clients;
DROP POLICY IF EXISTS "jwt_company_clients_update" ON public.clients;

-- Revenues
DROP POLICY IF EXISTS "jwt_company_pending_revenues_select" ON public.pending_revenues;
DROP POLICY IF EXISTS "jwt_company_confirmed_revenues_select" ON public.confirmed_revenues;

-- Profiles
DROP POLICY IF EXISTS "jwt_company_profiles_select" ON public.profiles;

-- ========================================
-- FASE 4: CRIAR FUNÇÃO SEGURA PARA COMPANY_ID
-- ========================================

CREATE OR REPLACE FUNCTION public.get_user_company_id_secure()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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

-- ========================================
-- FASE 5: CRIAR POLÍTICAS RLS RIGOROSAS COM COMPANY_ID
-- ========================================

-- Garantir RLS ativo
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confirmed_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS - Isolamento absoluto por company_id
CREATE POLICY "absolute_company_transactions_select" 
ON public.transactions FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_transactions_insert" 
ON public.transactions FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_transactions_update" 
ON public.transactions FOR UPDATE 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_transactions_delete" 
ON public.transactions FOR DELETE 
USING (company_id = public.get_user_company_id_secure());

-- PAYMENTS - Isolamento absoluto por company_id
CREATE POLICY "absolute_company_payments_select" 
ON public.payments FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_payments_insert" 
ON public.payments FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_payments_update" 
ON public.payments FOR UPDATE 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_payments_delete" 
ON public.payments FOR DELETE 
USING (company_id = public.get_user_company_id_secure());

-- MISSIONS - Isolamento absoluto por company_id
CREATE POLICY "absolute_company_missions_select" 
ON public.missions FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_missions_insert" 
ON public.missions FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_missions_update" 
ON public.missions FOR UPDATE 
USING (company_id = public.get_user_company_id_secure());

-- EXPENSES - Isolamento absoluto por company_id
CREATE POLICY "absolute_company_expenses_select" 
ON public.expenses FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_expenses_insert" 
ON public.expenses FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_expenses_update" 
ON public.expenses FOR UPDATE 
USING (company_id = public.get_user_company_id_secure());

-- PENDING_REVENUES - Isolamento absoluto por company_id
CREATE POLICY "absolute_company_pending_revenues_select" 
ON public.pending_revenues FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_pending_revenues_insert" 
ON public.pending_revenues FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

-- CONFIRMED_REVENUES - Isolamento absoluto por company_id
CREATE POLICY "absolute_company_confirmed_revenues_select" 
ON public.confirmed_revenues FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_confirmed_revenues_insert" 
ON public.confirmed_revenues FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

-- SERVICE_PROVIDERS - Isolamento por company_id
CREATE POLICY "absolute_company_providers_select" 
ON public.service_providers FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_providers_insert" 
ON public.service_providers FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_providers_update" 
ON public.service_providers FOR UPDATE 
USING (company_id = public.get_user_company_id_secure());

-- CLIENTS - Isolamento por company_id
CREATE POLICY "absolute_company_clients_select" 
ON public.clients FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_clients_insert" 
ON public.clients FOR INSERT 
WITH CHECK (company_id = public.get_user_company_id_secure());

CREATE POLICY "absolute_company_clients_update" 
ON public.clients FOR UPDATE 
USING (company_id = public.get_user_company_id_secure());

-- PROFILES - Usuários veem apenas perfis da própria empresa
CREATE POLICY "absolute_company_profiles_select" 
ON public.profiles FOR SELECT 
USING (company_id = public.get_user_company_id_secure());

-- ========================================
-- FASE 6: CORRIGIR FUNÇÕES DE INSERÇÃO
-- ========================================

-- Atualizar função insert_transaction_with_casting para usar company_id seguro
CREATE OR REPLACE FUNCTION public.insert_transaction_with_casting(p_type text, p_category text, p_amount numeric, p_description text, p_date date, p_method text, p_status text, p_user_id uuid, p_user_name text, p_mission_id uuid DEFAULT NULL::uuid, p_receipt text DEFAULT NULL::text, p_tags text[] DEFAULT NULL::text[], p_account_id uuid DEFAULT NULL::uuid, p_account_type text DEFAULT NULL::text)
RETURNS TABLE(id uuid, type text, category text, amount numeric, description text, date date, method text, status text, user_id uuid, user_name text, receipt text, tags text[], mission_id uuid, account_id uuid, account_type text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_transaction_id UUID;
  user_company_id UUID;
BEGIN
  -- Buscar company_id do usuário de forma segura
  user_company_id := public.get_user_company_id_secure();
  
  -- Validar que o usuário tem company_id
  IF user_company_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não possui empresa associada';
  END IF;
  
  -- Inserir com company_id obrigatório
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

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar dados órfãos restantes
SELECT 
  'transactions' as tabela, 
  count(*) FILTER (WHERE company_id IS NULL) as sem_empresa,
  count(*) FILTER (WHERE company_id IS NOT NULL) as com_empresa
FROM public.transactions 
UNION ALL
SELECT 
  'payments' as tabela, 
  count(*) FILTER (WHERE company_id IS NULL) as sem_empresa,
  count(*) FILTER (WHERE company_id IS NOT NULL) as com_empresa
FROM public.payments
UNION ALL
SELECT 
  'missions' as tabela, 
  count(*) FILTER (WHERE company_id IS NULL) as sem_empresa,
  count(*) FILTER (WHERE company_id IS NOT NULL) as com_empresa
FROM public.missions
UNION ALL
SELECT 
  'expenses' as tabela, 
  count(*) FILTER (WHERE company_id IS NULL) as sem_empresa,
  count(*) FILTER (WHERE company_id IS NOT NULL) as com_empresa
FROM public.expenses;

-- Log de sucesso
DO $$
BEGIN
  RAISE LOG 'ISOLAMENTO COMPLETO IMPLEMENTADO: Todas as tabelas isoladas por company_id com RLS rigoroso';
END $$;
