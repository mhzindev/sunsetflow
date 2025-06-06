
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
  updatePayment: (id: string, updates: any) => void;
  updatePaymentStatus: (id: string, status: string) => void;
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

  const { fetchTransactions, fetchExpenses, fetchPayments, fetchBankAccounts, fetchCreditCards } = useSupabaseData();

  const fetchData = async () => {
    try {
      console.log('=== INICIANDO FETCH DOS DADOS FINANCEIROS ===');
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

      // Mapear pagamentos para o formato correto do frontend
      const mappedPayments = payments?.map(payment => ({
        ...payment,
        providerId: payment.provider_id, // Mapear provider_id para providerId
        providerName: payment.provider_name || 'Prestador não especificado',
        dueDate: payment.due_date,
        paymentDate: payment.payment_date,
        currentInstallment: payment.current_installment,
        accountId: payment.account_id,
        accountType: payment.account_type
      })) || [];

      console.log('Pagamentos mapeados:', mappedPayments.length);

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
      const pendingPayments = mappedPayments?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const approvedExpenses = expenses?.filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const newData = {
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
        payments: mappedPayments, // Usar pagamentos mapeados
        accounts: [...(bankAccounts || []), ...(creditCards || [])],
        loading: false,
        error: null
      };

      console.log('=== DADOS FINANCEIROS ATUALIZADOS ===');
      console.log('Total de pagamentos:', newData.payments.length);
      console.log('Pagamentos pendentes:', newData.payments.filter(p => p.status === 'pending').length);
      console.log('Valor pendente:', pendingPayments);

      setData(newData);

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

  // Função para processar pagamento - ATUALIZADA
  const processPayment = (payment: any) => {
    console.log('Processando pagamento no contexto:', payment.id);
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => 
        p.id === payment.id ? { 
          ...p, 
          status: 'completed', 
          paymentDate: new Date().toISOString().split('T')[0] 
        } : p
      )
    }));
  };

  // Função para atualizar pagamento - MELHORADA
  const updatePayment = (id: string, updates: any) => {
    console.log('Atualizando pagamento no contexto:', id, updates);
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(payment => 
        payment.id === id ? { ...payment, ...updates } : payment
      )
    }));
  };

  // Função para atualizar status de pagamento - MELHORADA
  const updatePaymentStatus = (id: string, status: string) => {
    console.log('Atualizando status do pagamento:', id, status);
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(payment => 
        payment.id === id ? { ...payment, status } : payment
      )
    }));
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
