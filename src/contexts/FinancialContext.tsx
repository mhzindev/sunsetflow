import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseDataIsolated } from '@/hooks/useSupabaseDataIsolated';
import { useAuth } from './AuthContext';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';

interface FinancialData {
  totalBalance: number;
  bankBalance: number;
  creditUsed: number;
  creditAvailable: number;
  totalResources: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  approvedExpenses: number;
  pendingRevenues: number;
  confirmedRevenues: number;
  transactions: any[];
  expenses: any[];
  payments: any[];
  accounts: any[];
  pendingRevenuesList: any[];
  confirmedRevenuesList: any[];
  loading: boolean;
  error: string | null;
}

interface FinancialContextType {
  data: FinancialData;
  refetch: () => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
  getRecentTransactions: (limit?: number) => any[];
  updateExpenseStatus: (id: string, status: string) => void;
  processPayment: (payment: any) => void;
  updatePayment: (id: string, updates: any) => Promise<boolean>;
  updatePaymentStatus: (id: string, status: string) => Promise<boolean>;
  removePayment: (id: string) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const { isValidated, companyId } = useCompanyIsolation();
  const isOwner = profile?.role === 'admin' || profile?.user_type === 'admin';
  
  const [data, setData] = useState<FinancialData>({
    totalBalance: 0,
    bankBalance: 0,
    creditUsed: 0,
    creditAvailable: 0,
    totalResources: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    approvedExpenses: 0,
    pendingRevenues: 0,
    confirmedRevenues: 0,
    transactions: [],
    expenses: [],
    payments: [],
    accounts: [],
    pendingRevenuesList: [],
    confirmedRevenuesList: [],
    loading: true,
    error: null
  });

  const { 
    fetchTransactions, 
    fetchExpenses, 
    fetchPayments, 
    fetchPendingRevenues,
    fetchConfirmedRevenues,
    loading: hookLoading
  } = useSupabaseDataIsolated();

  const fetchData = async () => {
    // Só buscar dados se estiver validado e tiver company_id
    if (!isValidated || !companyId) {
      console.log('FinancialContext: Aguardando validação de empresa...');
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Aguardando validação de empresa' 
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      console.log('FinancialContext: Iniciando busca de dados isolados para empresa:', companyId);

      const [transactions, expenses, payments, pendingRevenues, confirmedRevenues] = await Promise.all([
        fetchTransactions(),
        isOwner ? fetchExpenses() : [],
        isOwner ? fetchPayments() : [],
        isOwner ? fetchPendingRevenues() : [],
        isOwner ? fetchConfirmedRevenues() : []
      ]);

      console.log('FinancialContext: Dados carregados com isolamento para empresa', companyId, {
        transactions: transactions?.length || 0,
        expenses: expenses?.length || 0,
        payments: payments?.length || 0,
        pendingRevenues: pendingRevenues?.length || 0,
        confirmedRevenues: confirmedRevenues?.length || 0
      });

      // Filtrar dados dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions?.filter(t => 
        new Date(t.date) >= thirtyDaysAgo
      ) || [];

      // Calcular receitas e despesas dos últimos 30 dias
      const monthlyIncome = recentTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthlyExpenses = recentTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calcular valores das receitas
      const pendingRevenuesTotal = pendingRevenues?.filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

      const confirmedRevenuesTotal = confirmedRevenues
        ?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

      // Calcular pendências (apenas para donos)
      const pendingPaymentsTotal = payments?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const approvedExpenses = expenses?.filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setData({
        totalBalance: monthlyIncome - monthlyExpenses,
        bankBalance: 0,
        creditUsed: 0,
        creditAvailable: 0,
        totalResources: 0,
        monthlyIncome,
        monthlyExpenses,
        pendingPayments: pendingPaymentsTotal,
        approvedExpenses,
        pendingRevenues: pendingRevenuesTotal,
        confirmedRevenues: confirmedRevenuesTotal,
        transactions: transactions || [],
        expenses: expenses || [],
        payments: payments || [],
        accounts: [],
        pendingRevenuesList: pendingRevenues || [],
        confirmedRevenuesList: confirmedRevenues || [],
        loading: false,
        error: null
      });

      console.log('FinancialContext: Dados processados com sucesso para empresa:', companyId);

    } catch (error: any) {
      console.error('FinancialContext: Erro ao carregar dados para empresa', companyId, error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao carregar dados financeiros'
      }));
    }
  };

  const getRecentTransactions = (limit: number = 10) => {
    return data.transactions
      .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        date: t.date,
        status: t.status,
        userName: t.user_name
      }));
  };

  const updateExpenseStatus = (id: string, status: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => 
        expense.id === id ? { ...expense, status } : expense
      )
    }));
  };

  const processPayment = (payment: any) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => 
        p.id === payment.id ? { ...p, status: 'completed', payment_date: new Date().toISOString().split('T')[0] } : p
      )
    }));
  };

  const removePayment = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id)
    }));
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

  useEffect(() => {
    if (profile && isValidated && companyId) {
      console.log('FinancialContext: Perfil e empresa validados, buscando dados isolados...');
      fetchData();
    } else {
      console.log('FinancialContext: Aguardando validação completa...', {
        hasProfile: !!profile,
        isValidated,
        companyId
      });
    }
  }, [profile, isValidated, companyId]);

  const contextValue: FinancialContextType = {
    data,
    refetch: fetchData,
    refreshData: fetchData,
    loading: data.loading || hookLoading,
    error: data.error,
    getRecentTransactions,
    updateExpenseStatus,
    processPayment,
    updatePayment,
    updatePaymentStatus,
    removePayment
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

}
