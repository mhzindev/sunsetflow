
-- PASSO 1: Verificar e corrigir dados órfãos
-- Identificar registros sem company_id
SELECT 'transactions' as tabela, count(*) as registros_sem_company 
FROM public.transactions WHERE company_id IS NULL
UNION ALL
SELECT 'payments' as tabela, count(*) as registros_sem_company 
FROM public.payments WHERE company_id IS NULL
UNION ALL
SELECT 'expenses' as tabela, count(*) as registros_sem_company 
FROM public.expenses WHERE employee_id NOT IN (SELECT id FROM public.profiles WHERE company_id IS NOT NULL)
UNION ALL
SELECT 'confirmed_revenues' as tabela, count(*) as registros_sem_company 
FROM public.confirmed_revenues WHERE id NOT IN (
  SELECT cr.id FROM public.confirmed_revenues cr
  JOIN public.missions m ON cr.mission_id = m.id
  JOIN public.profiles p ON m.created_by = p.id
  WHERE p.company_id IS NOT NULL
)
UNION ALL
SELECT 'pending_revenues' as tabela, count(*) as registros_sem_company 
FROM public.pending_revenues WHERE id NOT IN (
  SELECT pr.id FROM public.pending_revenues pr
  JOIN public.missions m ON pr.mission_id = m.id
  JOIN public.profiles p ON m.created_by = p.id
  WHERE p.company_id IS NOT NULL
);

-- PASSO 2: Aplicar RLS rigoroso em todas as tabelas
-- Remover políticas existentes e recriar com isolamento total

-- Transactions - Isolamento por company_id
DROP POLICY IF EXISTS "Users can view company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete company transactions" ON public.transactions;

CREATE POLICY "Strict company isolation for transactions SELECT" 
  ON public.transactions 
  FOR SELECT 
  USING (
    company_id IS NOT NULL AND
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for transactions INSERT" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for transactions UPDATE" 
  ON public.transactions 
  FOR UPDATE 
  USING (
    company_id IS NOT NULL AND
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for transactions DELETE" 
  ON public.transactions 
  FOR DELETE 
  USING (
    company_id IS NOT NULL AND
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Payments - Isolamento por company_id
DROP POLICY IF EXISTS "Users can view company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete company payments" ON public.payments;

CREATE POLICY "Strict company isolation for payments SELECT" 
  ON public.payments 
  FOR SELECT 
  USING (
    company_id IS NOT NULL AND
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for payments INSERT" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for payments UPDATE" 
  ON public.payments 
  FOR UPDATE 
  USING (
    company_id IS NOT NULL AND
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for payments DELETE" 
  ON public.payments 
  FOR DELETE 
  USING (
    company_id IS NOT NULL AND
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Expenses - Isolamento por employee_id em profiles com company_id
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their expenses" ON public.expenses;

CREATE POLICY "Strict company isolation for expenses SELECT" 
  ON public.expenses 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Strict company isolation for expenses INSERT" 
  ON public.expenses 
  FOR INSERT 
  WITH CHECK (
    employee_id = auth.uid() AND
    auth.uid() IN (SELECT id FROM public.profiles WHERE company_id IS NOT NULL)
  );

CREATE POLICY "Strict company isolation for expenses UPDATE" 
  ON public.expenses 
  FOR UPDATE 
  USING (
    employee_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Strict company isolation for expenses DELETE" 
  ON public.expenses 
  FOR DELETE 
  USING (
    employee_id = auth.uid()
  );

-- Missions - Isolamento rigoroso
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company missions" ON public.missions;
DROP POLICY IF EXISTS "Users can insert their missions" ON public.missions;
DROP POLICY IF EXISTS "Users can update their missions" ON public.missions;

CREATE POLICY "Strict company isolation for missions SELECT" 
  ON public.missions 
  FOR SELECT 
  USING (
    created_by IN (
      SELECT id FROM public.profiles 
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Strict company isolation for missions INSERT" 
  ON public.missions 
  FOR INSERT 
  WITH CHECK (
    created_by = auth.uid() AND
    auth.uid() IN (SELECT id FROM public.profiles WHERE company_id IS NOT NULL)
  );

CREATE POLICY "Strict company isolation for missions UPDATE" 
  ON public.missions 
  FOR UPDATE 
  USING (
    created_by IN (
      SELECT id FROM public.profiles 
      WHERE company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Confirmed Revenues - Isolamento por missão
ALTER TABLE public.confirmed_revenues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company confirmed revenues" ON public.confirmed_revenues;
DROP POLICY IF EXISTS "Users can insert company confirmed revenues" ON public.confirmed_revenues;

CREATE POLICY "Strict company isolation for confirmed_revenues SELECT" 
  ON public.confirmed_revenues 
  FOR SELECT 
  USING (
    mission_id IN (
      SELECT m.id FROM public.missions m
      JOIN public.profiles p ON m.created_by = p.id
      WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Strict company isolation for confirmed_revenues INSERT" 
  ON public.confirmed_revenues 
  FOR INSERT 
  WITH CHECK (
    mission_id IN (
      SELECT m.id FROM public.missions m
      JOIN public.profiles p ON m.created_by = p.id
      WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Pending Revenues - Isolamento por missão
ALTER TABLE public.pending_revenues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company pending revenues" ON public.pending_revenues;
DROP POLICY IF EXISTS "Users can insert company pending revenues" ON public.pending_revenues;

CREATE POLICY "Strict company isolation for pending_revenues SELECT" 
  ON public.pending_revenues 
  FOR SELECT 
  USING (
    mission_id IN (
      SELECT m.id FROM public.missions m
      JOIN public.profiles p ON m.created_by = p.id
      WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Strict company isolation for pending_revenues INSERT" 
  ON public.pending_revenues 
  FOR INSERT 
  WITH CHECK (
    mission_id IN (
      SELECT m.id FROM public.missions m
      JOIN public.profiles p ON m.created_by = p.id
      WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Service Providers - Isolamento por company_id
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company service providers" ON public.service_providers;
DROP POLICY IF EXISTS "Users can insert company service providers" ON public.service_providers;

CREATE POLICY "Strict company isolation for service_providers SELECT" 
  ON public.service_providers 
  FOR SELECT 
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for service_providers INSERT" 
  ON public.service_providers 
  FOR INSERT 
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Clients - Isolamento por empresa
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Adicionar company_id a clients se não existir
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id uuid;

CREATE POLICY "Strict company isolation for clients SELECT" 
  ON public.clients 
  FOR SELECT 
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Strict company isolation for clients INSERT" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- PASSO 3: Corrigir função get_cash_flow_projections para isolamento rigoroso
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
  -- Buscar company_id do usuário
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Se não tiver company_id, retornar vazio
  IF user_company_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Retornar apenas dados da empresa do usuário
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
  JOIN public.profiles prof ON m.created_by = prof.id
  WHERE prof.company_id = user_company_id
    AND pr.status = 'pending'
    AND pr.due_date >= CURRENT_DATE
  
  ORDER BY month;
END;
$$;

-- PASSO 4: Atualizar dados órfãos com company_id padrão ou remover
-- Criar empresa padrão para dados históricos se necessário
INSERT INTO public.companies (id, name, legal_name, cnpj, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dados Históricos',
  'Empresa de Dados Históricos LTDA',
  '00.000.000/0001-00',
  'historico@sistema.com'
) ON CONFLICT (id) DO NOTHING;

-- Limpar dados órfãos ou associar à empresa padrão
-- (Opcionalmente pode deletar se preferir começar limpo)
UPDATE public.transactions 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

UPDATE public.payments 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- Log da operação
SELECT 'RLS Policies updated for strict company isolation' as result;
