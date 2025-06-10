
-- First, drop the problematic security definer view
DROP VIEW IF EXISTS public.cash_flow_projections;

-- Add company_id to transactions table if not exists
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS company_id uuid;

-- Add company_id to payments table if not exists  
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS company_id uuid;

-- Update existing transactions with company_id from user's profile
UPDATE public.transactions 
SET company_id = (
  SELECT p.company_id 
  FROM public.profiles p 
  WHERE p.id = transactions.user_id
)
WHERE company_id IS NULL;

-- Update existing payments with company_id (assuming they belong to the first company for now)
UPDATE public.payments 
SET company_id = (
  SELECT id FROM public.companies LIMIT 1
)
WHERE company_id IS NULL;

-- Enable RLS on transactions and payments if not already enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert company transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert company payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update company payments" ON public.payments;

-- Create RLS policies for transactions based on company isolation
CREATE POLICY "Users can view company transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR 
    public.is_company_owner()
  );

CREATE POLICY "Users can insert company transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create RLS policies for payments based on company isolation
CREATE POLICY "Users can view company payments" 
  ON public.payments 
  FOR SELECT 
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR 
    public.is_company_owner()
  );

CREATE POLICY "Users can insert company payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update company payments" 
  ON public.payments 
  FOR UPDATE 
  USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR 
    public.is_company_owner()
  );

-- Create a secure function to get cash flow projections without SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_cash_flow_projections()
RETURNS TABLE(
  month timestamp with time zone,
  type text,
  amount numeric,
  description text
)
LANGUAGE plpgsql
STABLE
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
