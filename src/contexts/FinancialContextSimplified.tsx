
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
  updateExpenseStatus: (expenseId: string, status: string) => Promise<void>;
  updatePayment: (id: string, updates: any) => Promise<boolean>;
  updatePaymentStatus: (id: string, status: string) => Promise<boolean>;
  removePayment: (id: string) => void;
  fetchTransactions: () => Promise<any[]>;
  fetchPayments: () => Promise<any[]>;
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
  updateExpenseStatus: async () => {},
  updatePayment: async () => false,
  updatePaymentStatus: async () => false,
  removePayment: () => {},
  fetchTransactions: async () => [],
  fetchPayments: async () => [],
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
  const { user, profile } = useAuth();

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user || !profile?.company_id) {
        console.log('🔒 FinancialContext: Usuário sem empresa associada');
        setTotalBalance(0);
        setTotalRevenue(0);
        setTotalExpenses(0);
        setData({
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
        return;
      }

      console.log('🏢 FinancialContext: Carregando dados para empresa:', profile.company_id);

      // Buscar saldo total das contas bancárias (filtrado por user_id para contas pessoais)
      const { data: accounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('user_id', user.id);

      if (accountsError) {
        throw new Error(`Erro ao buscar contas: ${accountsError.message}`);
      }

      const balance = accounts?.reduce((acc, account) => acc + (account.balance || 0), 0) || 0;
      setTotalBalance(balance);

      // Buscar receitas (RLS já filtra por company_id)
      const { data: revenues, error: revenuesError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'income');

      if (revenuesError) {
        console.warn('⚠️ Erro ao buscar receitas:', revenuesError);
      }

      const revenue = revenues?.reduce((acc, transaction) => acc + (transaction.amount || 0), 0) || 0;
      setTotalRevenue(revenue);

      // Buscar despesas (RLS já filtra por company_id)
      const { data: expenses, error: expensesError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense');

      if (expensesError) {
        console.warn('⚠️ Erro ao buscar despesas:', expensesError);
      }

      const expense = expenses?.reduce((acc, transaction) => acc + (transaction.amount || 0), 0) || 0;
      setTotalExpenses(expense);

      // Buscar dados completos para o contexto data (RLS já filtra por company_id)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
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

      // Buscar pagamentos (RLS já filtra por company_id)
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

      // Buscar receitas pendentes (RLS já filtra por company_id)
      const { data: pendingRevenues, error: pendingError } = await supabase
        .from('pending_revenues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pendingError) {
        setData(prev => ({
          ...prev,
          pendingRevenuesList: pendingRevenues || [],
          pendingRevenues: pendingRevenues?.length || 0,
        }));
      }

      // Buscar receitas confirmadas (RLS já filtra por company_id)
      const { data: confirmedRevenues, error: confirmedError } = await supabase
        .from('confirmed_revenues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!confirmedError) {
        setData(prev => ({
          ...prev,
          confirmedRevenuesList: confirmedRevenues || [],
          confirmedRevenues: confirmedRevenues?.length || 0,
        }));
      }

      console.log('✅ FinancialContext: Dados carregados com isolamento por empresa');

    } catch (err: any) {
      console.error('❌ Erro ao carregar dados financeiros:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (!profile?.company_id) {
        console.log('🔒 fetchTransactions: Sem empresa associada');
        return [];
      }

      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      return [];
    }
  };

  const fetchPayments = async () => {
    try {
      if (!profile?.company_id) {
        console.log('🔒 fetchPayments: Sem empresa associada');
        return [];
      }

      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      return [];
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

  const updateExpenseStatus = async (expenseId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', expenseId);

      if (error) throw error;
      
      // Refresh data after update
      await fetchFinancialData();
    } catch (error) {
      console.error('Error updating expense status:', error);
      throw error;
    }
  };

  const updatePayment = async (id: string, updates: any): Promise<boolean> => {
    try {
      console.log('FinancialContext: Iniciando atualização do pagamento:', { id, updates });
      
      if (!id || typeof id !== 'string') {
        console.error('FinancialContext: ID do pagamento inválido:', id);
        return false;
      }

      const currentPayment = data.payments.find(p => p.id === id);
      if (!currentPayment) {
        console.error('FinancialContext: Pagamento não encontrado no estado local:', id);
        return false;
      }

      console.log('FinancialContext: Pagamento atual:', currentPayment);
      
      setData(prev => ({
        ...prev,
        payments: prev.payments.map(payment => 
          payment.id === id ? { ...payment, ...updates } : payment
        )
      }));
      
      console.log('FinancialContext: Pagamento atualizado com sucesso no estado local');
      return true;
      
    } catch (error) {
      console.error('FinancialContext: Erro inesperado na atualização:', error);
      return false;
    }
  };

  const updatePaymentStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      console.log('FinancialContext: Atualizando status do pagamento:', { id, status });
      
      const updates: any = { 
        status: status
      };
      
      if (status === 'completed') {
        updates.payment_date = new Date().toISOString().split('T')[0];
        console.log('FinancialContext: Adicionando data de pagamento:', updates.payment_date);
      }
      
      const success = await updatePayment(id, updates);
      
      if (success) {
        console.log('FinancialContext: Status atualizado com sucesso');
      } else {
        console.error('FinancialContext: Falha ao atualizar status');
      }
      
      return success;
      
    } catch (error) {
      console.error('FinancialContext: Erro ao atualizar status:', error);
      return false;
    }
  };

  const removePayment = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id)
    }));
  };

  useEffect(() => {
    if (user && profile?.company_id) {
      fetchFinancialData();
    } else if (user && !profile?.company_id) {
      console.log('🔒 FinancialContext: Usuário logado mas sem empresa associada');
      setLoading(false);
    }
  }, [user, profile?.company_id]);

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
    updateExpenseStatus,
    updatePayment,
    updatePaymentStatus,
    removePayment,
    fetchTransactions,
    fetchPayments,
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
