import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAccounts } from '@/hooks/useAccounts';
import { Transaction, Expense, Payment } from '@/types/transaction';

interface FinancialData {
  transactions: Transaction[];
  expenses: any[];
  payments: Payment[];
  missions: any[];
  clients: any[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  pendingExpenses: number;
  approvedExpenses: number;
  bankBalance: number;
  creditAvailable: number;
  creditUsed: number;
  totalResources: number;
}

interface FinancialContextType {
  data: FinancialData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getRecentTransactions: (limit?: number) => Transaction[];
  getCashFlowProjections: () => any[];
  addTransaction: (transaction: any) => Promise<any>;
  addPayment: (payment: any) => Promise<any>;
  updatePayment: (paymentId: string, updates: any) => Promise<any>;
  updatePaymentStatus: (paymentId: string, status: string) => Promise<any>;
  processPayment: (paymentId: string) => Promise<any>;
  updateExpenseStatus: (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => Promise<any>;
  processExpenseApproval: (expenseId: string) => Promise<any>;
  processExpenseReimbursement: (expenseId: string) => Promise<any>;
  addMission: (mission: any) => Promise<any>;
  updateMission: (missionId: string, updates: any) => Promise<any>;
  addClient: (client: any) => Promise<any>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider = ({ children }: FinancialProviderProps) => {
  const supabaseData = useSupabaseData();
  const { getAccountSummary, loading: accountsLoading, refreshAccounts } = useAccounts();
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    expenses: [],
    payments: [],
    missions: [],
    clients: [],
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    bankBalance: 0,
    creditAvailable: 0,
    creditUsed: 0,
    totalResources: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateFinancialData = useCallback((
    transactions: any[], 
    expenses: any[], 
    payments: any[], 
    missions: any[],
    clients: any[],
    accountSummary: any
  ): FinancialData => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filtrar transações dos últimos 30 dias
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= thirtyDaysAgo
    );

    // Calcular receitas e despesas do mês
    const monthlyIncome = recentTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const monthlyExpenses = recentTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    // Calcular pagamentos e despesas pendentes
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const pendingExpenses = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const approvedExpenses = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Dados das contas
    const bankBalance = accountSummary.totalBankBalance || 0;
    const creditAvailable = accountSummary.totalCreditAvailable || 0;
    const creditUsed = accountSummary.totalCreditUsed || 0;
    const totalResources = bankBalance + creditAvailable;
    const totalBalance = bankBalance - creditUsed;

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        category: t.category,
        amount: parseFloat(t.amount) || 0,
        description: t.description,
        date: t.date,
        method: t.method,
        status: t.status,
        userId: t.user_id,
        userName: t.user_name,
        receipt: t.receipt,
        tags: t.tags,
        missionId: t.mission_id
      })),
      expenses: expenses.map(e => ({
        id: e.id,
        missionId: e.mission_id,
        employeeName: e.employee_name,
        employee_role: e.employee_role,
        category: e.category,
        description: e.description,
        amount: parseFloat(e.amount) || 0,
        date: e.date,
        isAdvanced: e.is_advanced,
        status: e.status,
        accommodationDetails: e.accommodation_details,
        missions: e.missions
      })),
      payments: payments.map(p => ({
        id: p.id,
        providerId: p.provider_id,
        providerName: p.provider_name,
        amount: parseFloat(p.amount) || 0,
        dueDate: p.due_date,
        paymentDate: p.payment_date,
        status: p.status,
        type: p.type,
        description: p.description,
        installments: p.installments,
        currentInstallment: p.current_installment,
        tags: p.tags,
        notes: p.notes
      })),
      missions,
      clients,
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      pendingPayments,
      pendingExpenses,
      approvedExpenses,
      bankBalance,
      creditAvailable,
      creditUsed,
      totalResources
    };
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await refreshAccounts();

      const [transactions, expenses, payments, missions, clients] = await Promise.all([
        supabaseData.fetchTransactions(),
        supabaseData.fetchExpenses(),
        supabaseData.fetchPayments(),
        supabaseData.fetchMissions(),
        supabaseData.fetchClients()
      ]);

      const accountSummary = getAccountSummary();

      const financialData = calculateFinancialData(
        transactions, 
        expenses, 
        payments, 
        missions,
        clients,
        accountSummary
      );

      setData(financialData);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [supabaseData, getAccountSummary, refreshAccounts, calculateFinancialData]);

  useEffect(() => {
    if (!accountsLoading) {
      refreshData();
    }
  }, [accountsLoading, refreshData]);

  const contextValue = {
    data,
    loading: loading || accountsLoading,
    error,
    refreshData,
    getRecentTransactions: (limit: number = 5): Transaction[] => {
      return data.transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    },
    getCashFlowProjections: () => [],
    addTransaction: async (transaction: any) => {
      try {
        const result = await supabaseData.insertTransaction(transaction);
        if (!result.error) {
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao adicionar transação:', err);
        return { data: null, error: 'Erro ao adicionar transação' };
      }
    },
    addPayment: async (payment: any) => {
      try {
        console.log('Criando pagamento no contexto:', payment);
        const result = await supabaseData.insertPayment(payment);
        if (!result.error) {
          console.log('Pagamento criado com sucesso, atualizando dados...');
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao adicionar pagamento:', err);
        return { data: null, error: 'Erro ao adicionar pagamento' };
      }
    },
    updatePayment: async (paymentId: string, updates: any) => {
      try {
        console.log('Atualizando pagamento no contexto:', paymentId, updates);
        const result = await supabaseData.updatePayment(paymentId, updates);
        if (!result.error) {
          console.log('Pagamento atualizado com sucesso, refreshing data...');
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao atualizar pagamento:', err);
        return { data: null, error: 'Erro ao atualizar pagamento' };
      }
    },
    updatePaymentStatus: async (paymentId: string, status: string) => {
      return contextValue.updatePayment(paymentId, { status, payment_date: status === 'completed' ? new Date().toISOString().split('T')[0] : null });
    },
    processPayment: async (paymentId: string) => {
      return contextValue.updatePaymentStatus(paymentId, 'completed');
    },
    updateExpenseStatus: async (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => {
      try {
        const result = await supabaseData.updateExpenseStatus(expenseId, status);
        if (!result.error) {
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao atualizar status da despesa:', err);
        return { data: null, error: 'Erro ao atualizar status da despesa' };
      }
    },
    processExpenseApproval: async (expenseId: string) => {
      return contextValue.updateExpenseStatus(expenseId, 'approved');
    },
    processExpenseReimbursement: async (expenseId: string) => {
      return contextValue.updateExpenseStatus(expenseId, 'reimbursed');
    },
    addMission: async (mission: any) => {
      try {
        const result = await supabaseData.insertMission(mission);
        if (!result.error) {
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao adicionar missão:', err);
        return { data: null, error: 'Erro ao adicionar missão' };
      }
    },
    updateMission: async (missionId: string, updates: any) => {
      try {
        const result = await supabaseData.updateMission(missionId, updates);
        if (!result.error) {
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao atualizar missão:', err);
        return { data: null, error: 'Erro ao atualizar missão' };
      }
    },
    addClient: async (client: any) => {
      try {
        const result = await supabaseData.insertClient(client);
        if (!result.error) {
          await refreshData();
        }
        return result;
      } catch (err) {
        console.error('Erro ao adicionar cliente:', err);
        return { data: null, error: 'Erro ao adicionar cliente' };
      }
    }
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
