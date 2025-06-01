
import React, { createContext, useState, useContext } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  status: 'pending' | 'completed' | 'cancelled';
  tags: string[];
  createdAt: string;
  userId: string;
  userName: string;
}

interface Receivable {
  id: string;
  clientName: string;
  amount: number;
  description: string;
  expectedDate: string;
  notes: string;
  createdDate: string;
  userId: string;
  userName: string;
  status: 'pending' | 'completed' | 'overdue';
}

interface Payment {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled';
  type: 'full' | 'installment' | 'advance' | 'partial';
  description: string;
  notes?: string;
}

interface FinancialContextProps {
  transactions: Transaction[];
  receivables: Receivable[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addReceivable: (receivable: Omit<Receivable, 'id'>) => void;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  processExpenseApproval: (expenseId: string, amount: number, description: string) => void;
  processExpenseReimbursement: (expenseId: string, amount: number, description: string, employeeName: string) => void;
  expenses: any[];
  addExpense: (expenseData: any) => void;
  data: {
    transactions: Transaction[];
    receivables: Receivable[];
    expenses: any[];
    payments: Payment[];
    // Computed properties
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    pendingPayments: number;
    pendingExpenses: number;
    approvedExpenses: number;
  };
  getRecentTransactions: (limit?: number) => Transaction[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updateExpenseStatus: (id: string, status: string) => void;
  processPayment: (paymentId: string) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  updatePaymentStatus: (id: string, status: Payment['status']) => void;
  getCashFlowProjections: () => any[];
}

const FinancialContext = createContext<FinancialContextProps | undefined>(undefined);

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'Consulting',
    description: 'Consulting services for Client A',
    amount: 5000,
    date: '2024-01-15',
    isRecurring: false,
    status: 'completed',
    tags: ['consulting', 'clientA'],
    createdAt: '2024-01-01',
    userId: '1',
    userName: 'John Doe'
  },
  {
    id: '2',
    type: 'expense',
    category: 'Marketing',
    description: 'Facebook Ads campaign',
    amount: 1500,
    date: '2024-01-20',
    isRecurring: false,
    status: 'completed',
    tags: ['ads', 'facebook', 'marketing'],
    createdAt: '2024-01-05',
    userId: '1',
    userName: 'John Doe'
  },
];

const mockReceivables: Receivable[] = [
  {
    id: '1',
    clientName: 'Client B',
    amount: 3000,
    description: 'Website development project',
    expectedDate: '2024-02-28',
    notes: 'Initial payment for the project',
    createdDate: '2024-01-10',
    userId: '1',
    userName: 'John Doe',
    status: 'pending'
  },
];

const mockPayments: Payment[] = [
  {
    id: '1',
    providerId: 'provider-1',
    providerName: 'Provider A',
    amount: 2000,
    dueDate: '2024-02-15',
    status: 'pending',
    type: 'full',
    description: 'Service payment'
  },
];

const mockMissions = [
  { id: '1', title: 'Instalação - Cliente ABC' },
  { id: '2', title: 'Manutenção - Cliente XYZ' },
  { id: '3', title: 'Instalação - Cliente DEF' }
];

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [receivables, setReceivables] = useState<Receivable[]>(mockReceivables);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  // Calculate financial metrics
  const calculateFinancialMetrics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Monthly income and expenses (last 30 days)
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo && t.status === 'completed';
    });

    const monthlyIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total balance (all completed income - all completed expenses)
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;

    // Pending payments
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // Pending and approved expenses
    const pendingExpenses = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const approvedExpenses = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      pendingPayments,
      pendingExpenses,
      approvedExpenses
    };
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      // Ensure all required fields are present
      isRecurring: transaction.isRecurring ?? false,
      tags: transaction.tags ?? [],
      createdAt: transaction.createdAt ?? new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const addReceivable = (receivable: Omit<Receivable, 'id'>) => {
    setReceivables(prev => [...prev, { id: Date.now().toString(), ...receivable }]);
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    setPayments(prev => [...prev, { id: Date.now().toString(), ...payment }]);
  };

  const updateTransactionStatus = (id: string, status: Transaction['status']) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id ? { ...transaction, status } : transaction
      )
    );
  };

  const updateExpenseStatus = (id: string, status: string) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, status } : expense
      )
    );
  };

  const updatePayment = (id: string, data: Partial<Payment>) => {
    setPayments(prev =>
      prev.map(payment =>
        payment.id === id ? { ...payment, ...data } : payment
      )
    );
  };

  const updatePaymentStatus = (id: string, status: Payment['status']) => {
    setPayments(prev =>
      prev.map(payment =>
        payment.id === id ? { ...payment, status } : payment
      )
    );
  };

  const processPayment = (paymentId: string) => {
    updatePaymentStatus(paymentId, 'completed');
  };

  const getRecentTransactions = (limit: number = 5) => {
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const getCashFlowProjections = () => {
    // Simple projection logic
    return [];
  };

  const processExpenseApproval = (expenseId: string, amount: number, description: string) => {
    // Criar uma transação de despesa
    const transaction: Omit<Transaction, 'id'> = {
      type: 'expense',
      category: 'expenses',
      description: `Aprovação - ${description}`,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      status: 'completed',
      tags: ['despesa', 'aprovada'],
      createdAt: new Date().toISOString(),
      userId: 'admin',
      userName: 'Admin'
    };

    addTransaction(transaction);
  };

  const processExpenseReimbursement = (expenseId: string, amount: number, description: string, employeeName: string) => {
    // Criar uma transação de despesa
    const transaction: Omit<Transaction, 'id'> = {
      type: 'expense',
      category: 'reimbursement',
      description: `Reembolso - ${description} para ${employeeName}`,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      status: 'completed',
      tags: ['despesa', 'reembolso'],
      createdAt: new Date().toISOString(),
      userId: 'admin',
      userName: 'Admin'
    };

    addTransaction(transaction);
  };

  const addExpense = (expenseData: any) => {
    const newExpense = {
      id: Date.now().toString(),
      mission: mockMissions.find(m => m.id === expenseData.missionId)?.title || 'Missão Desconhecida',
      employee: expenseData.employeeName,
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date,
      isAdvanced: expenseData.isAdvanced,
      status: expenseData.status,
      reimbursementAmount: expenseData.reimbursementAmount,
      thirdPartyCompany: expenseData.thirdPartyCompany
    };

    setExpenses(prev => [...prev, newExpense]);

    // Registrar impacto financeiro imediatamente para adiantamentos
    if (expenseData.isAdvanced) {
      const transaction = {
        type: 'expense' as const,
        category: 'expenses',
        description: `Adiantamento - ${expenseData.description}`,
        amount: expenseData.amount,
        date: expenseData.date,
        isRecurring: false,
        status: 'completed' as const,
        tags: ['despesa', 'adiantamento', expenseData.category],
        createdAt: new Date().toISOString(),
        userId: expenseData.employeeId,
        userName: expenseData.employeeName
      };

      addTransaction(transaction);

      // Para hospedagem com adiantamento, registrar também o recebível
      if (expenseData.category === 'accommodation' && expenseData.reimbursementAmount && expenseData.thirdPartyCompany) {
        const receivable = {
          clientName: expenseData.thirdPartyCompany,
          amount: expenseData.reimbursementAmount,
          description: `Ressarcimento - ${expenseData.description}`,
          expectedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
          notes: `Ressarcimento referente ao adiantamento de hospedagem para ${expenseData.employeeName}`,
          createdDate: new Date().toISOString().split('T')[0],
          userId: expenseData.employeeId,
          userName: expenseData.employeeName,
          status: 'pending' as const
        };

        addReceivable(receivable);
      }
    }
  };

  // Calculate current financial metrics
  const financialMetrics = calculateFinancialMetrics();

  const data = {
    transactions,
    receivables,
    expenses,
    payments,
    ...financialMetrics
  };

  const value: FinancialContextProps = {
    transactions,
    receivables,
    addTransaction,
    addReceivable,
    updateTransactionStatus,
    processExpenseApproval,
    processExpenseReimbursement,
    expenses,
    addExpense,
    data,
    getRecentTransactions,
    addPayment,
    updateExpenseStatus,
    processPayment,
    updatePayment,
    updatePaymentStatus,
    getCashFlowProjections
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
