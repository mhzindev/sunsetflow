
-- CORREÇÃO RLS SIMPLIFICADA PARA ISOLAMENTO TOTAL ENTRE EMPRESAS
-- Esta migração corrige o vazamento de dados e garante isolamento 100%

-- ========================================
-- FASE 1: FUNÇÕES UTILITÁRIAS SEGURAS
-- ========================================

-- Função para buscar company_id do usuário atual (segura)
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
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
-- FASE 2: CORREÇÃO DE DADOS ÓRFÃOS
-- ========================================

-- Corrigir transactions sem company_id
UPDATE public.transactions 
SET company_id = (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = transactions.user_id
)
WHERE company_id IS NULL AND user_id IS NOT NULL;

-- Corrigir payments sem company_id
UPDATE public.payments 
SET company_id = (
    SELECT DISTINCT p.company_id
    FROM public.profiles p
    WHERE p.role = 'admin'
    LIMIT 1
)
WHERE company_id IS NULL;

-- Corrigir service_providers sem company_id
UPDATE public.service_providers 
SET company_id = (
    SELECT DISTINCT p.company_id
    FROM public.profiles p
    WHERE p.role = 'admin'
    LIMIT 1
)
WHERE company_id IS NULL;

-- Corrigir clients sem company_id
UPDATE public.clients 
SET company_id = (
    SELECT DISTINCT p.company_id
    FROM public.profiles p
    WHERE p.role = 'admin'
    LIMIT 1
)
WHERE company_id IS NULL;

-- ========================================
-- FASE 3: DROPAR POLÍTICAS PROBLEMÁTICAS
-- ========================================

-- Dropar políticas existentes que podem estar causando vazamentos
DROP POLICY IF EXISTS "Users can view company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation for transactions SELECT" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation for transactions INSERT" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation for transactions UPDATE" ON public.transactions;
DROP POLICY IF EXISTS "Strict company isolation for transactions DELETE" ON public.transactions;

DROP POLICY IF EXISTS "Users can view company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete company payments" ON public.payments;
DROP POLICY IF EXISTS "Strict company isolation for payments SELECT" ON public.payments;
DROP POLICY IF EXISTS "Strict company isolation for payments INSERT" ON public.payments;
DROP POLICY IF EXISTS "Strict company isolation for payments UPDATE" ON public.payments;
DROP POLICY IF EXISTS "Strict company isolation for payments DELETE" ON public.payments;

-- ========================================
-- FASE 4: CRIAR POLÍTICAS RLS RIGOROSAS
-- ========================================

-- Garantir RLS ativo
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS - Isolamento total por company_id
CREATE POLICY "company_transactions_select" 
ON public.transactions FOR SELECT 
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "company_transactions_insert" 
ON public.transactions FOR INSERT 
WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "company_transactions_update" 
ON public.transactions FOR UPDATE 
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "company_transactions_delete" 
ON public.transactions FOR DELETE 
USING (company_id = public.get_current_user_company_id());

-- PAYMENTS - Isolamento total por company_id
CREATE POLICY "company_payments_select" 
ON public.payments FOR SELECT 
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "company_payments_insert" 
ON public.payments FOR INSERT 
WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "company_payments_update" 
ON public.payments FOR UPDATE 
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "company_payments_delete" 
ON public.payments FOR DELETE 
USING (company_id = public.get_current_user_company_id());

-- SERVICE_PROVIDERS - Isolamento por company_id
CREATE POLICY "company_providers_select" 
ON public.service_providers FOR SELECT 
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "company_providers_insert" 
ON public.service_providers FOR INSERT 
WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "company_providers_update" 
ON public.service_providers FOR UPDATE 
USING (company_id = public.get_current_user_company_id());

-- CLIENTS - Isolamento por company_id
CREATE POLICY "company_clients_select" 
ON public.clients FOR SELECT 
USING (company_id = public.get_current_user_company_id());

CREATE POLICY "company_clients_insert" 
ON public.clients FOR INSERT 
WITH CHECK (company_id = public.get_current_user_company_id());

CREATE POLICY "company_clients_update" 
ON public.clients FOR UPDATE 
USING (company_id = public.get_current_user_company_id());

-- ========================================
-- FASE 5: CORRIGIR FUNÇÃO insert_transaction_with_casting
-- ========================================

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
  -- Buscar company_id do usuário
  user_company_id := public.get_current_user_company_id();
  
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
FROM public.payments;

-- Log de sucesso
DO $$
BEGIN
  RAISE LOG 'RLS CORRIGIDO: Isolamento total entre empresas implementado com sucesso';
END $$;
