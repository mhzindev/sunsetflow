import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialContextType {
  totalBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  loading: boolean;
  error: string | null;
  data: {
    transactions: any[];
    expenses: any[];
    payments: any[];
    accounts: any[];
    pendingRevenuesList: any[];
    confirmedRevenuesList: any[];
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    pendingPayments: number;
    approvedExpenses: number;
    pendingRevenues: number;
    confirmedRevenues: number;
  };
  getRecentTransactions: (limit?: number) => any[];
  refetch: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType>({
  totalBalance: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  loading: true,
  error: null,
  data: {
    transactions: [],
    expenses: [],
    payments: [],
    accounts: [],
    pendingRevenuesList: [],
    confirmedRevenuesList: [],
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    approvedExpenses: 0,
    pendingRevenues: 0,
    confirmedRevenues: 0,
  },
  getRecentTransactions: () => [],
  refetch: async () => {},
  refreshData: async () => {},
});

export const FinancialProviderSimplified = ({ children }: { children: ReactNode }) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    transactions: [],
    expenses: [],
    payments: [],
    accounts: [],
    pendingRevenuesList: [],
    confirmedRevenuesList: [],
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    approvedExpenses: 0,
    pendingRevenues: 0,
    confirmedRevenues: 0,
  });
  const { user } = useAuth();

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

      // Buscar dados completos para o contexto data
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!transactionsError) {
        setData(prev => ({
          ...prev,
          transactions: transactions || [],
          totalBalance: balance,
          monthlyIncome: revenue,
          monthlyExpenses: expense,
        }));
      }

      // Buscar pagamentos
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!paymentsError) {
        setData(prev => ({
          ...prev,
          payments: payments || [],
        }));
      }

    } catch (err: any) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getRecentTransactions = (limit: number = 10) => {
    return data.transactions
      .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
      .slice(0, limit);
  };

  const refetch = async () => {
    await fetchFinancialData();
  };

  const refreshData = async () => {
    await fetchFinancialData();
  };

  useEffect(() => {
    fetchFinancialData();
  }, [user]);

  const value = {
    totalBalance,
    totalRevenue,
    totalExpenses,
    loading,
    error,
    data,
    getRecentTransactions,
    refetch,
    refreshData,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancialSimplified = () => {
  return useContext(FinancialContext);
};

// Keep the old export for backward compatibility
export const useFinancial = () => {
  return useContext(FinancialContext);
};

// Also export the provider with the original name for backward compatibility
export const FinancialProvider = FinancialProviderSimplified;
