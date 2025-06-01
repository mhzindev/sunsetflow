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

const mockMissions = [
  { id: '1', title: 'Instalação - Cliente ABC' },
  { id: '2', title: 'Manutenção - Cliente XYZ' },
  { id: '3', title: 'Instalação - Cliente DEF' }
];

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [receivables, setReceivables] = useState<Receivable[]>(mockReceivables);
  const [expenses, setExpenses] = useState<any[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { id: Date.now().toString(), ...transaction }]);
  };

  const addReceivable = (receivable: Omit<Receivable, 'id'>) => {
    setReceivables(prev => [...prev, { id: Date.now().toString(), ...receivable }]);
  };

  const updateTransactionStatus = (id: string, status: Transaction['status']) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id ? { ...transaction, status } : transaction
      )
    );
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
        id: Date.now().toString(),
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

      setTransactions(prev => [...prev, transaction]);

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

  const value: FinancialContextProps = {
    transactions,
    receivables,
    addTransaction,
    addReceivable,
    updateTransactionStatus,
    processExpenseApproval,
    processExpenseReimbursement,
    expenses,
    addExpense
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
