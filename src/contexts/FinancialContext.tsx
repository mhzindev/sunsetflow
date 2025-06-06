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

  const { fetchTransactions, fetchExpenses, fetchPayments, fetchBankAccounts, fetchCreditCards, updatePayment: updatePaymentInDB } = useSupabaseData();

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Buscar dados usando a nova função RPC que implementa lógica hierárquica
      const [transactions, expenses, payments, bankAccounts, creditCards] = await Promise.all([
        fetchTransactions(),
        isOwner ? fetchExpenses() : [], // Só buscar despesas se for dono
        isOwner ? fetchPayments() : [], // Só buscar pagamentos se for dono
        isOwner ? fetchBankAccounts() : [], // Só buscar contas se for dono
        isOwner ? fetchCreditCards() : [] // Só buscar cartões se for dono
      ]);

      console.log('=== DEBUG: Dados carregados no FinancialContext ===');
      console.log('Tipo de usuário:', profile?.role, profile?.user_type);
      console.log('É dono?', isOwner);
      console.log('Transações carregadas:', transactions?.length || 0);
      console.log('Despesas carregadas:', expenses?.length || 0);
      console.log('Pagamentos carregados:', payments?.length || 0);

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

    } catch (error: any) {
      console.error('Erro ao carregar dados financeiros:', error);
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

  // CORRIGIDO: Função para atualizar pagamento - agora persiste no banco PRIMEIRO
  const updatePayment = async (id: string, updates: any): Promise<boolean> => {
    try {
      console.log('FinancialContext: Atualizando pagamento no banco:', id, updates);
      
      // 1. Primeiro, atualizar no banco de dados
      const { data: result, error } = await updatePaymentInDB(id, updates);
      
      if (error) {
        console.error('FinancialContext: Erro ao atualizar pagamento no banco:', error);
        return false;
      }
      
      // 2. Só atualizar estado local APÓS sucesso no banco
      setData(prev => ({
        ...prev,
        payments: prev.payments.map(payment => 
          payment.id === id ? { ...payment, ...updates } : payment
        )
      }));
      
      console.log('FinancialContext: Pagamento atualizado com sucesso:', result);
      return true;
      
    } catch (error) {
      console.error('FinancialContext: Erro inesperado ao atualizar pagamento:', error);
      return false;
    }
  };

  // CORRIGIDO: Função para atualizar status de pagamento - agora persiste no banco PRIMEIRO
  const updatePaymentStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      console.log('FinancialContext: Atualizando status do pagamento no banco:', id, status);
      
      // 1. Preparar dados para atualização
      const updates: any = { 
        status: status
      };
      
      // Se for marcado como completed, adicionar data de pagamento
      if (status === 'completed') {
        updates.payment_date = new Date().toISOString().split('T')[0];
      }
      
      // 2. Primeiro, atualizar no banco de dados
      const { data: result, error } = await updatePaymentInDB(id, updates);
      
      if (error) {
        console.error('FinancialContext: Erro ao atualizar status no banco:', error);
        return false;
      }
      
      // 3. Só atualizar estado local APÓS sucesso no banco
      setData(prev => ({
        ...prev,
        payments: prev.payments.map(payment => 
          payment.id === id ? { ...payment, ...updates } : payment
        )
      }));
      
      console.log('FinancialContext: Status do pagamento atualizado com sucesso:', result);
      return true;
      
    } catch (error) {
      console.error('FinancialContext: Erro inesperado ao atualizar status:', error);
      return false;
    }
  };

  useEffect(() => {
    if (profile) {
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
    updatePaymentStatus
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
