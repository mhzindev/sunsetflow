
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Transaction } from '@/types/transaction';
import { Payment } from '@/types/payment';

interface Expense {
  id: string;
  missionId: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: 'pending' | 'approved' | 'reimbursed';
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
  };
}

interface FinancialData {
  transactions: Transaction[];
  payments: Payment[];
  expenses: Expense[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  pendingExpenses: number;
  approvedExpenses: number;
}

interface FinancialContextType {
  data: FinancialData;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getRecentTransactions: (limit?: number) => Transaction[];
  getCashFlowProjections: () => any[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  processPayment: (payment: Payment) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  updatePaymentStatus: (id: string, status: Payment['status']) => Promise<void>;
  updateExpenseStatus: (id: string, status: Expense['status']) => Promise<void>;
  processExpenseApproval: (id: string, amount: number, description: string) => Promise<void>;
  processExpenseReimbursement: (id: string, amount: number, description: string, employeeName: string) => Promise<void>;
  addReceivable: (receivable: any) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    payments: [],
    expenses: [],
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    if (!isAuthenticated || !user) {
      setData({
        transactions: [],
        payments: [],
        expenses: [],
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        pendingPayments: 0,
        pendingExpenses: 0,
        approvedExpenses: 0,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Buscar transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Buscar pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Buscar despesas
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // Converter dados para o formato esperado
      const transactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        category: t.category,
        amount: Number(t.amount),
        description: t.description,
        date: t.date,
        method: t.method,
        status: t.status,
        userId: t.user_id,
        userName: t.user_name,
        receipt: t.receipt,
        tags: t.tags || [],
        missionId: t.mission_id
      }));

      const payments: Payment[] = (paymentsData || []).map(p => ({
        id: p.id,
        providerId: p.provider_id,
        providerName: p.provider_name,
        amount: Number(p.amount),
        dueDate: p.due_date,
        paymentDate: p.payment_date,
        status: p.status,
        type: p.type,
        description: p.description,
        installments: p.installments,
        currentInstallment: p.current_installment,
        tags: p.tags || [],
        notes: p.notes
      }));

      const expenses: Expense[] = (expensesData || []).map(e => ({
        id: e.id,
        missionId: e.mission_id,
        employeeId: e.employee_id,
        employeeName: e.employee_name,
        category: e.category,
        description: e.description,
        amount: Number(e.amount),
        date: e.date,
        isAdvanced: e.is_advanced,
        status: e.status,
        accommodationDetails: e.accommodation_details
      }));

      // Calcular métricas
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyIncome = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'income' && 
                 tDate.getMonth() === currentMonth && 
                 tDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' && 
                 tDate.getMonth() === currentMonth && 
                 tDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const totalBalance = transactions
        .reduce((sum, t) => {
          return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);

      const pendingPayments = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingExpenses = expenses
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.amount, 0);

      const approvedExpenses = expenses
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0);

      setData({
        transactions,
        payments,
        expenses,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        pendingPayments,
        pendingExpenses,
        approvedExpenses,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentTransactions = (limit = 5) => {
    return data.transactions.slice(0, limit);
  };

  const getCashFlowProjections = () => {
    return [
      {
        period: 'Próximos 7 dias',
        expectedIncome: data.pendingPayments * 0.3,
        expectedExpenses: 15000.00,
        netFlow: (data.pendingPayments * 0.3) - 15000.00,
        status: (data.pendingPayments * 0.3) - 15000.00 > 0 ? 'positive' : 'negative'
      },
      {
        period: 'Próximos 30 dias',
        expectedIncome: data.pendingPayments * 0.7,
        expectedExpenses: 45000.00,
        netFlow: (data.pendingPayments * 0.7) - 45000.00,
        status: (data.pendingPayments * 0.7) - 45000.00 > 0 ? 'positive' : 'warning'
      }
    ];
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          method: transaction.method,
          status: transaction.status || 'completed',
          user_id: user?.id,
          user_name: transaction.userName || user?.name,
          company_id: user?.id, // Assumindo que o ID do usuário é o ID da empresa por enquanto
          receipt: transaction.receipt,
          tags: transaction.tags,
          mission_id: transaction.missionId
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          provider_id: payment.providerId,
          provider_name: payment.providerName,
          amount: payment.amount,
          due_date: payment.dueDate,
          payment_date: payment.paymentDate,
          status: payment.status || 'pending',
          type: payment.type || 'full',
          description: payment.description,
          installments: payment.installments,
          current_installment: payment.currentInstallment,
          tags: payment.tags,
          notes: payment.notes,
          company_id: user?.id // Assumindo que o ID do usuário é o ID da empresa por enquanto
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          mission_id: expense.missionId,
          employee_id: user?.id,
          employee_name: expense.employeeName || user?.name,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          is_advanced: expense.isAdvanced,
          status: expense.status || 'pending',
          company_id: user?.id, // Assumindo que o ID do usuário é o ID da empresa por enquanto
          accommodation_details: expense.accommodationDetails
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      throw error;
    }
  };

  const processPayment = async (payment: Payment) => {
    try {
      // Atualizar status do pagamento
      await updatePaymentStatus(payment.id, 'completed');
      
      // Criar transação correspondente
      await addTransaction({
        type: 'expense',
        category: 'service_payment',
        amount: payment.amount,
        description: `Pagamento para ${payment.providerName}`,
        date: new Date().toISOString().split('T')[0],
        method: 'pix',
        status: 'completed',
        userId: user?.id || '',
        userName: user?.name || '',
        tags: ['payment', 'processed']
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          provider_name: updates.providerName,
          amount: updates.amount,
          due_date: updates.dueDate,
          payment_date: updates.paymentDate,
          status: updates.status,
          type: updates.type,
          description: updates.description,
          notes: updates.notes
        })
        .eq('id', id);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw error;
    }
  };

  const updatePaymentStatus = async (id: string, status: Payment['status']) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  };

  const updateExpenseStatus = async (id: string, status: Expense['status']) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar status da despesa:', error);
      throw error;
    }
  };

  const processExpenseApproval = async (id: string, amount: number, description: string) => {
    try {
      await updateExpenseStatus(id, 'approved');
      
      // Criar transação correspondente
      await addTransaction({
        type: 'expense',
        category: 'other',
        amount: amount,
        description: `Despesa aprovada: ${description}`,
        date: new Date().toISOString().split('T')[0],
        method: 'other',
        status: 'completed',
        userId: user?.id || '',
        userName: user?.name || '',
        tags: ['expense', 'approved']
      });
    } catch (error) {
      console.error('Erro ao aprovar despesa:', error);
      throw error;
    }
  };

  const processExpenseReimbursement = async (id: string, amount: number, description: string, employeeName: string) => {
    try {
      await updateExpenseStatus(id, 'reimbursed');
      
      // Criar transação de reembolso
      await addTransaction({
        type: 'expense',
        category: 'other',
        amount: amount,
        description: `Reembolso para ${employeeName}: ${description}`,
        date: new Date().toISOString().split('T')[0],
        method: 'pix',
        status: 'completed',
        userId: user?.id || '',
        userName: user?.name || '',
        tags: ['reimbursement', 'processed']
      });
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      throw error;
    }
  };

  const addReceivable = async (receivable: any) => {
    // Por enquanto, vamos tratar recebíveis como transações de receita
    await addTransaction({
      type: 'income',
      category: 'client_payment',
      amount: receivable.amount,
      description: receivable.description || 'Recebível',
      date: receivable.date || new Date().toISOString().split('T')[0],
      method: 'pix',
      status: 'pending',
      userId: user?.id || '',
      userName: user?.name || '',
      tags: ['receivable']
    });
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated, user]);

  const value = {
    data,
    isLoading,
    refreshData,
    getRecentTransactions,
    getCashFlowProjections,
    addTransaction,
    addPayment,
    addExpense,
    processPayment,
    updatePayment,
    updatePaymentStatus,
    updateExpenseStatus,
    processExpenseApproval,
    processExpenseReimbursement,
    addReceivable,
  };

  return (
    <FinancialContext.Provider value={value}>
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
