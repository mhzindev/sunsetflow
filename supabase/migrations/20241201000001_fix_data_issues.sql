
-- Criar função RPC para dados financeiros do dashboard
CREATE OR REPLACE FUNCTION get_financial_dashboard_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  monthly_income NUMERIC := 0;
  monthly_expenses NUMERIC := 0;
  total_balance NUMERIC := 0;
  bank_balance NUMERIC := 0;
  credit_available NUMERIC := 0;
  credit_used NUMERIC := 0;
  pending_payments NUMERIC := 0;
  approved_expenses NUMERIC := 0;
BEGIN
  -- Calcular receitas dos últimos 30 dias
  SELECT COALESCE(SUM(amount), 0) INTO monthly_income
  FROM transactions 
  WHERE type = 'income' 
    AND status = 'completed'
    AND date >= CURRENT_DATE - INTERVAL '30 days';

  -- Calcular despesas dos últimos 30 dias (incluindo transactions e expenses)
  SELECT COALESCE(SUM(amount), 0) INTO monthly_expenses
  FROM (
    SELECT amount FROM transactions 
    WHERE type = 'expense' 
      AND status = 'completed'
      AND date >= CURRENT_DATE - INTERVAL '30 days'
    UNION ALL
    SELECT amount FROM expenses
    WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  ) AS all_expenses;

  -- Calcular saldo total de contas bancárias
  SELECT COALESCE(SUM(balance), 0) INTO bank_balance
  FROM bank_accounts 
  WHERE is_active = true;

  -- Calcular limite de crédito disponível e usado
  SELECT 
    COALESCE(SUM(available_limit), 0),
    COALESCE(SUM(used_limit), 0)
  INTO credit_available, credit_used
  FROM credit_cards 
  WHERE is_active = true;

  -- Calcular pagamentos pendentes
  SELECT COALESCE(SUM(amount), 0) INTO pending_payments
  FROM payments 
  WHERE status = 'pending';

  -- Calcular despesas aprovadas para reembolso
  SELECT COALESCE(SUM(amount), 0) INTO approved_expenses
  FROM expenses 
  WHERE status = 'approved';

  -- Calcular saldo líquido (dinheiro em conta - dívidas de cartão)
  total_balance := bank_balance - credit_used;

  -- Construir resultado JSON
  result := json_build_object(
    'monthlyIncome', monthly_income,
    'monthlyExpenses', monthly_expenses,
    'bankBalance', bank_balance,
    'creditAvailable', credit_available,
    'creditUsed', credit_used,
    'totalResources', bank_balance + credit_available,
    'totalBalance', total_balance,
    'pendingPayments', pending_payments,
    'approvedExpenses', approved_expenses
  );

  RETURN result;
END;
$$;

-- Criar função RPC para listar despesas de viagem
CREATE OR REPLACE FUNCTION get_travel_expenses()
RETURNS TABLE(
  id uuid,
  mission_id uuid,
  category text,
  description text,
  amount numeric,
  date date,
  status expense_status,
  employee_name text,
  employee_role text,
  created_at timestamp with time zone,
  mission_title text,
  mission_location text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.mission_id,
    e.category,
    e.description,
    e.amount,
    e.date,
    e.status,
    e.employee_name,
    e.employee_role,
    e.created_at,
    m.title as mission_title,
    m.location as mission_location
  FROM expenses e
  LEFT JOIN missions m ON e.mission_id = m.id
  ORDER BY e.created_at DESC;
END;
$$;

-- Criar função RPC para listar funcionários ativos
CREATE OR REPLACE FUNCTION get_active_employees()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  phone text,
  role text,
  active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.email,
    e.phone,
    e.role,
    e.active
  FROM employees e
  WHERE e.active = true
  ORDER BY e.name ASC;
END;
$$;

-- Criar função RPC para criar missão
CREATE OR REPLACE FUNCTION create_mission(
  p_title text,
  p_description text,
  p_location text,
  p_start_date date,
  p_end_date date,
  p_service_value numeric,
  p_company_percentage integer,
  p_provider_percentage integer,
  p_client_name text,
  p_assigned_employees uuid[],
  p_employee_names text[],
  p_status text
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_mission_id uuid;
  result JSON;
BEGIN
  -- Inserir nova missão
  INSERT INTO missions (
    title,
    description,
    location,
    start_date,
    end_date,
    service_value,
    company_percentage,
    provider_percentage,
    client_name,
    assigned_employees,
    employee_names,
    status,
    created_by
  ) VALUES (
    p_title,
    p_description,
    p_location,
    p_start_date,
    p_end_date,
    p_service_value,
    p_company_percentage,
    p_provider_percentage,
    p_client_name,
    p_assigned_employees,
    p_employee_names,
    p_status,
    auth.uid()
  ) RETURNING id INTO new_mission_id;

  -- Retornar dados da missão criada
  SELECT json_build_object(
    'id', new_mission_id,
    'title', p_title,
    'description', p_description,
    'location', p_location,
    'start_date', p_start_date,
    'end_date', p_end_date,
    'service_value', p_service_value,
    'company_percentage', p_company_percentage,
    'provider_percentage', p_provider_percentage,
    'client_name', p_client_name,
    'assigned_employees', p_assigned_employees,
    'employee_names', p_employee_names,
    'status', p_status,
    'created_at', now()
  ) INTO result;

  RETURN result;
END;
$$;
