import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialContextType {
  totalBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  loading: boolean;
  error: string | null;
}

const FinancialContext = createContext<FinancialContextType>({
  totalBalance: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  loading: true,
  error: null,
});

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          setTotalBalance(0);
          setTotalRevenue(0);
          setTotalExpenses(0);
          return;
        }

        // Buscar saldo total das contas bancárias
        const { data: accounts, error: accountsError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('user_id', user.id);

        if (accountsError) {
          throw accountsError;
        }

        const balance = accounts?.reduce((acc, account) => acc + (account.balance || 0), 0) || 0;
        setTotalBalance(balance);

        // Buscar receitas
        const { data: revenues, error: revenuesError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'income');

        if (revenuesError) {
          throw revenuesError;
        }

        const revenue = revenues?.reduce((acc, transaction) => acc + (transaction.amount || 0), 0) || 0;
        setTotalRevenue(revenue);

        // Buscar despesas
        const { data: expenses, error: expensesError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'expense');

        if (expensesError) {
          throw expensesError;
        }

        const expense = expenses?.reduce((acc, transaction) => acc + (transaction.amount || 0), 0) || 0;
        setTotalExpenses(expense);

      } catch (err: any) {
        console.error('Erro ao carregar dados financeiros:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [user]);

  const value = {
    totalBalance,
    totalRevenue,
    totalExpenses,
    loading,
    error,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  return useContext(FinancialContext);
};
