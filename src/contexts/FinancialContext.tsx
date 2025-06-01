
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  const calculateFinancialData = (
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

    // Dados das contas - agora vem do hook useAccounts com dados reais
    const bankBalance = accountSummary.totalBankBalance || 0;
    const creditAvailable = accountSummary.totalCreditAvailable || 0;
    const creditUsed = accountSummary.totalCreditUsed || 0;
    
    // Total de recursos disponíveis (dinheiro em conta + limite disponível)
    const totalResources = bankBalance + creditAvailable;
    
    // Saldo total real (considerando que cartão de crédito é dívida)
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
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro atualizar as contas para ter dados atualizados
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
  };

  // Função para obter transações recentes
  const getRecentTransactions = (limit: number = 5): Transaction[] => {
    return data.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getCashFlowProjections = () => {
    return [];
  };

  const addTransaction = async (transaction: any) => {
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
  };

  const addPayment = async (payment: any) => {
    try {
      const result = await supabaseData.insertPayment(payment);
      if (!result.error) {
        await refreshData();
      }
      return result;
    } catch (err) {
      console.error('Erro ao adicionar pagamento:', err);
      return { data: null, error: 'Erro ao adicionar pagamento' };
    }
  };

  const updatePayment = async (paymentId: string, updates: any) => {
    try {
      const result = await supabaseData.updatePayment(paymentId, updates);
      if (!result.error) {
        await refreshData();
      }
      return result;
    } catch (err) {
      console.error('Erro ao atualizar pagamento:', err);
      return { data: null, error: 'Erro ao atualizar pagamento' };
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    return updatePayment(paymentId, { status });
  };

  const processPayment = async (paymentId: string) => {
    return updatePaymentStatus(paymentId, 'completed');
  };

  const updateExpenseStatus = async (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => {
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
  };

  const processExpenseApproval = async (expenseId: string) => {
    return updateExpenseStatus(expenseId, 'approved');
  };

  const processExpenseReimbursement = async (expenseId: string) => {
    return updateExpenseStatus(expenseId, 'reimbursed');
  };

  const addMission = async (mission: any) => {
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
  };

  const updateMission = async (missionId: string, updates: any) => {
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
  };

  const addClient = async (client: any) => {
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
  };

  useEffect(() => {
    refreshData();
  }, [accountsLoading]); // Recarrega quando as contas terminam de carregar

  const contextValue = {
    data,
    loading: loading || accountsLoading,
    error,
    refreshData,
    getRecentTransactions,
    getCashFlowProjections,
    addTransaction,
    addPayment,
    updatePayment,
    updatePaymentStatus,
    processPayment,
    updateExpenseStatus,
    processExpenseApproval,
    processExpenseReimbursement,
    addMission,
    updateMission,
    addClient
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
