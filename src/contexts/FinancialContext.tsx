
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from './AuthContext';

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
  transactions: any[];
  expenses: any[];
  payments: any[];
  accounts: any[];
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
    transactions: [],
    expenses: [],
    payments: [],
    accounts: [],
    loading: true,
    error: null
  });

  const { 
    fetchTransactions, 
    fetchExpenses, 
    fetchPayments, 
    fetchBankAccounts, 
    fetchCreditCards, 
    updatePayment: updatePaymentInDB 
  } = useSupabaseData();

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      console.log('FinancialContext: Iniciando busca de dados...');

      const [transactions, expenses, payments, bankAccounts, creditCards] = await Promise.all([
        fetchTransactions(),
        isOwner ? fetchExpenses() : [],
        isOwner ? fetchPayments() : [],
        isOwner ? fetchBankAccounts() : [],
        isOwner ? fetchCreditCards() : []
      ]);

      console.log('FinancialContext: Dados carregados:', {
        transactions: transactions?.length || 0,
        expenses: expenses?.length || 0,
        payments: payments?.length || 0,
        bankAccounts: bankAccounts?.length || 0,
        creditCards: creditCards?.length || 0
      });

      // Verificar pagamentos órfãos
      const orphanPayments = payments?.filter(p => !p.providerId && p.providerName) || [];
      if (orphanPayments.length > 0) {
        console.warn('FinancialContext: Encontrados pagamentos órfãos:', orphanPayments.length);
      }

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

      // Calcular saldos das contas (apenas para donos)
      const bankBalance = bankAccounts?.reduce((sum, account) => 
        sum + (account.balance || 0), 0) || 0;

      const creditUsed = creditCards?.reduce((sum, card) => 
        sum + (card.used_limit || 0), 0) || 0;

      const creditAvailable = creditCards?.reduce((sum, card) => 
        sum + (card.available_limit || 0), 0) || 0;

      const totalResources = bankBalance + creditAvailable;
      const totalBalance = bankBalance - creditUsed;

      // Calcular pendências (apenas para donos)
      const pendingPayments = payments?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const approvedExpenses = expenses?.filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setData({
        totalBalance,
        bankBalance,
        creditUsed,
        creditAvailable,
        totalResources,
        monthlyIncome,
        monthlyExpenses,
        pendingPayments,
        approvedExpenses,
        transactions: transactions || [],
        expenses: expenses || [],
        payments: payments || [],
        accounts: [...(bankAccounts || []), ...(creditCards || [])],
        loading: false,
        error: null
      });

      console.log('FinancialContext: Dados processados com sucesso');

    } catch (error: any) {
      console.error('FinancialContext: Erro ao carregar dados:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao carregar dados financeiros'
      }));
    }
  };

  // Função para obter transações recentes
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

  // Função para atualizar status de despesa
  const updateExpenseStatus = (id: string, status: string) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => 
        expense.id === id ? { ...expense, status } : expense
      )
    }));
  };

  // Função para processar pagamento
  const processPayment = (payment: any) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => 
        p.id === payment.id ? { ...p, status: 'completed', payment_date: new Date().toISOString().split('T')[0] } : p
      )
    }));
  };

  // Função para remover pagamento do estado local
  const removePayment = (id: string) => {
    setData(prev => ({
      ...prev,
      payments: prev.payments.filter(p => p.id !== id)
    }));
  };

  // MELHORADO: Função com melhor tratamento de erro e logs detalhados
  const updatePayment = async (id: string, updates: any): Promise<boolean> => {
    try {
      console.log('FinancialContext: Iniciando atualização do pagamento:', { id, updates });
      
      // Validação prévia
      if (!id || typeof id !== 'string') {
        console.error('FinancialContext: ID do pagamento inválido:', id);
        return false;
      }

      // Buscar pagamento atual para comparação
      const currentPayment = data.payments.find(p => p.id === id);
      if (!currentPayment) {
        console.error('FinancialContext: Pagamento não encontrado no estado local:', id);
        return false;
      }

      console.log('FinancialContext: Pagamento atual:', currentPayment);
      
      // Atualizar no banco de dados primeiro
      const { data: result, error } = await updatePaymentInDB(id, updates);
      
      if (error) {
        console.error('FinancialContext: Erro do banco de dados:', error);
        return false;
      }
      
      // Atualizar estado local apenas após sucesso no banco
      setData(prev => ({
        ...prev,
        payments: prev.payments.map(payment => 
          payment.id === id ? { ...payment, ...updates } : payment
        )
      }));
      
      console.log('FinancialContext: Pagamento atualizado com sucesso:', result);
      return true;
      
    } catch (error) {
      console.error('FinancialContext: Erro inesperado na atualização:', error);
      return false;
    }
  };

  // MELHORADO: Função com logs mais detalhados
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
    if (profile) {
      console.log('FinancialContext: Perfil carregado, buscando dados...');
      fetchData();
    }
  }, [profile]);

  const contextValue: FinancialContextType = {
    data,
    refetch: fetchData,
    refreshData: fetchData,
    loading: data.loading,
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
