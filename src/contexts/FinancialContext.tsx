
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  method: string;
  status: string;
  userName: string;
  userId?: string;
  missionId?: string;
  receipt?: string;
  tags?: string[];
}

interface Expense {
  id: string;
  missionId?: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: 'pending' | 'approved' | 'reimbursed';
  receipt?: string;
  accommodationDetails?: any;
  missions?: { title: string; location: string };
}

interface Payment {
  id: string;
  providerId?: string;
  providerName: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled';
  type: 'full' | 'installment' | 'advance';
  description: string;
  installments?: number;
  currentInstallment?: number;
  tags?: string[];
  notes?: string;
  service_providers?: {
    name: string;
    email: string;
    phone: string;
    service: string;
  };
}

interface FinancialData {
  transactions: Transaction[];
  expenses: Expense[];
  payments: Payment[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingPayments: number;
}

interface FinancialContextType {
  data: FinancialData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userName' | 'userId'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'employeeId' | 'employeeName' | 'status'>) => Promise<void>;
  updateExpenseStatus: (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => Promise<void>;
  getRecentTransactions: (limit?: number) => Transaction[];
  getExpensesByCategory: () => Record<string, number>;
  getCashFlowData: () => { month: string; income: number; expenses: number }[];
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const supabaseData = useSupabaseData();
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    expenses: [],
    payments: [],
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [transactions, expenses, payments] = await Promise.all([
        supabaseData.fetchTransactions(),
        supabaseData.fetchExpenses(),
        supabaseData.fetchPayments()
      ]);

      // Mapear dados para o formato esperado
      const mappedTransactions: Transaction[] = transactions.map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        category: t.category,
        amount: Number(t.amount),
        description: t.description,
        date: t.date,
        method: t.method,
        status: t.status,
        userName: t.user_name,
        userId: t.user_id,
        missionId: t.mission_id,
        receipt: t.receipt,
        tags: t.tags
      }));

      const mappedExpenses: Expense[] = expenses.map(e => ({
        id: e.id,
        missionId: e.mission_id,
        employeeId: e.employee_id,
        employeeName: e.employee_name,
        category: e.category,
        description: e.description,
        amount: Number(e.amount),
        date: e.date,
        isAdvanced: e.is_advanced || false,
        status: e.status as 'pending' | 'approved' | 'reimbursed',
        receipt: e.receipt,
        accommodationDetails: e.accommodation_details,
        missions: e.missions
      }));

      const mappedPayments: Payment[] = payments.map(p => ({
        id: p.id,
        providerId: p.provider_id,
        providerName: p.provider_name,
        amount: Number(p.amount),
        dueDate: p.due_date,
        paymentDate: p.payment_date,
        status: p.status as any,
        type: p.type as any,
        description: p.description,
        installments: p.installments,
        currentInstallment: p.current_installment,
        tags: p.tags,
        notes: p.notes,
        service_providers: p.service_providers
      }));

      // Calcular totais
      const totalIncome = mappedTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = mappedTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingPayments = mappedPayments
        .filter(p => p.status === 'pending' || p.status === 'overdue')
        .reduce((sum, p) => sum + p.amount, 0);

      setData({
        transactions: mappedTransactions,
        expenses: mappedExpenses,
        payments: mappedPayments,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        pendingPayments
      });
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userName' | 'userId'>) => {
    const result = await supabaseData.insertTransaction({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      method: transaction.method,
      status: transaction.status,
      mission_id: transaction.missionId,
      receipt: transaction.receipt,
      tags: transaction.tags
    });

    if (result.error) {
      throw new Error(result.error);
    }

    await refreshData();
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'employeeId' | 'employeeName' | 'status'>) => {
    const result = await supabaseData.insertExpense({
      mission_id: expense.missionId,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      is_advanced: expense.isAdvanced,
      receipt: expense.receipt,
      accommodation_details: expense.accommodationDetails
    });

    if (result.error) {
      throw new Error(result.error);
    }

    await refreshData();
  };

  const updateExpenseStatus = async (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => {
    const result = await supabaseData.updateExpenseStatus(expenseId, status);

    if (result.error) {
      throw new Error(result.error);
    }

    await refreshData();
  };

  const getRecentTransactions = (limit = 5) => {
    return data.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getExpensesByCategory = () => {
    return data.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const getCashFlowData = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // YYYY-MM
    }).reverse();

    return last6Months.map(month => {
      const monthTransactions = data.transactions.filter(t => 
        t.date.startsWith(month) && t.status === 'completed'
      );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expenses
      };
    });
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  return (
    <FinancialContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData,
        addTransaction,
        addExpense,
        updateExpenseStatus,
        getRecentTransactions,
        getExpensesByCategory,
        getCashFlowData
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial deve ser usado dentro de um FinancialProvider');
  }
  return context;
};
