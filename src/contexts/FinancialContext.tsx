
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
        isOwner ? fetchExpenses() : [],
        isOwner ? fetchPayments() : [],
        isOwner ? fetchBankAccounts() : [],
        isOwner ? fetchCreditCards() : []
      ]);

      console.log('=== DEBUG: Dados carregados no FinancialContext ===');
      console.log('Tipo de usuário:', profile?.role, profile?.user_type);
      console.log('É dono?', isOwner);
      console.log('Transações carregadas:', transactions?.length || 0);
      console.log('Despesas carregadas:', expenses?.length || 0);
      console.log('Pagamentos carregados (RAW):', payments?.length || 0);

      // Mapear pagamentos para o formato correto do frontend com logs detalhados
      const mappedPayments = payments?.map(payment => {
        console.log('Mapeando pagamento:', {
          id: payment.id,
          provider_id: payment.provider_id,
          provider_name: payment.provider_name,
          status: payment.status,
          amount: payment.amount
        });

        return {
          ...payment,
          providerId: payment.provider_id, // GARANTIR mapeamento correto
          providerName: payment.provider_name || 'Prestador não especificado',
          dueDate: payment.due_date,
          paymentDate: payment.payment_date,
          currentInstallment: payment.current_installment,
          accountId: payment.account_id,
          accountType: payment.account_type
        };
      }) || [];

      console.log('Pagamentos mapeados:', mappedPayments.length);
      console.log('Pagamentos por status:', {
        pending: mappedPayments.filter(p => p.status === 'pending').length,
        completed: mappedPayments.filter(p => p.status === 'completed').length,
        partial: mappedPayments.filter(p => p.status === 'partial').length
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

      console.log('=== DADOS FINANCEIROS FINALIZADOS ===');
      console.log('Total de pagamentos no contexto:', newData.payments.length);
      console.log('Pagamentos pendentes no contexto:', newData.payments.filter(p => p.status === 'pending').length);
      console.log('Valor pendente calculado:', pendingPayments);

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
    console.log('Atualizando status de despesa no contexto:', id, status);
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => 
        expense.id === id ? { ...expense, status } : expense
      )
    }));
  };

  // Função para processar pagamento - MELHORADA com logs
  const processPayment = (payment: any) => {
    console.log('=== PROCESSANDO PAGAMENTO NO CONTEXTO ===');
    console.log('Payment ID:', payment.id);
    console.log('Provider ID:', payment.providerId);
    console.log('Status atual:', payment.status);
    
    setData(prev => {
      const updatedPayments = prev.payments.map(p => {
        if (p.id === payment.id) {
          console.log('Encontrou pagamento para atualizar:', p.id);
          return { 
            ...p, 
            status: 'completed', 
            paymentDate: new Date().toISOString().split('T')[0] 
          };
        }
        return p;
      });
      
      console.log('Pagamentos atualizados no contexto:', updatedPayments.length);
      console.log('Pagamentos concluídos:', updatedPayments.filter(p => p.status === 'completed').length);
      
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  // Função para atualizar pagamento - MELHORADA com logs
  const updatePayment = (id: string, updates: any) => {
    console.log('=== ATUALIZANDO PAGAMENTO NO CONTEXTO ===');
    console.log('Payment ID:', id);
    console.log('Updates:', updates);
    
    setData(prev => {
      const updatedPayments = prev.payments.map(payment => {
        if (payment.id === id) {
          console.log('Pagamento encontrado e atualizado:', payment.id);
          return { ...payment, ...updates };
        }
        return payment;
      });
      
      console.log('Total de pagamentos após update:', updatedPayments.length);
      
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  // Função para atualizar status de pagamento - MELHORADA com logs
  const updatePaymentStatus = (id: string, status: string) => {
    console.log('=== ATUALIZANDO STATUS DO PAGAMENTO NO CONTEXTO ===');
    console.log('Payment ID:', id);
    console.log('Novo status:', status);
    
    setData(prev => {
      const updatedPayments = prev.payments.map(payment => {
        if (payment.id === id) {
          console.log('Status atualizado para pagamento:', payment.id, 'de', payment.status, 'para', status);
          return { ...payment, status };
        }
        return payment;
      });
      
      return {
        ...prev,
        payments: updatedPayments
      };
    });
  };

  useEffect(() => {
    if (profile) {
      console.log('Profile carregado, iniciando fetch de dados:', profile.role, profile.user_type);
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
