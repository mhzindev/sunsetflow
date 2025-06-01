import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { Payment } from '@/types/payment';

interface FinancialData {
  transactions: Transaction[];
  payments: Payment[];
  expenses: Expense[];
  receivables: Receivable[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  pendingExpenses: number;
  approvedExpenses: number;
  pendingReceivables: number;
}

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
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  reimbursedAt?: string;
  receipt?: string;
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
    outsourcingCompany?: string;
    invoiceNumber?: string;
  };
}

interface Receivable {
  id: string;
  clientName: string;
  amount: number;
  description: string;
  expectedDate: string;
  notes?: string;
  status: 'pending' | 'received' | 'overdue';
  createdDate: string;
  receivedDate?: string;
  userId: string;
  userName: string;
}

interface FinancialContextType {
  data: FinancialData;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addReceivable: (receivable: Omit<Receivable, 'id'>) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  updatePaymentStatus: (paymentId: string, status: Payment['status'], paymentDate?: string) => void;
  updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
  updateReceivableStatus: (receivableId: string, status: Receivable['status'], receivedDate?: string) => void;
  processPayment: (payment: Payment) => void;
  processExpenseApproval: (expenseId: string, amount: number, description: string) => void;
  processExpenseReimbursement: (expenseId: string, amount: number, description: string, employeeName: string) => void;
  processReceivablePayment: (receivableId: string) => void;
  cancelPayment: (paymentId: string) => void;
  getRecentTransactions: (limit?: number) => Transaction[];
  getCashFlowProjections: () => any[];
  getExpensesByStatus: (status: Expense['status']) => Expense[];
  getReceivablesByStatus: (status: Receivable['status']) => Receivable[];
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([
    // Exemplos de recebíveis para demonstração
    {
      id: '1',
      clientName: 'Empresa ABC Ltda',
      amount: 8500.00,
      description: 'Instalação de 15 rastreadores - Projeto Alpha',
      expectedDate: '2024-02-10',
      notes: 'Cliente solicitou pagamento em 30 dias',
      status: 'pending',
      createdDate: '2024-01-10',
      userId: '1',
      userName: 'Sistema'
    },
    {
      id: '2',
      clientName: 'Transportadora XYZ',
      amount: 3200.00,
      description: 'Manutenção mensal - Janeiro 2024',
      expectedDate: '2024-02-05',
      notes: 'Pagamento via PIX acordado',
      status: 'overdue',
      createdDate: '2024-01-05',
      userId: '1',
      userName: 'Sistema'
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      missionId: '1',
      employeeId: '1',
      employeeName: 'Carlos Santos',
      category: 'fuel',
      description: 'Combustível viagem São Paulo',
      amount: 280.50,
      date: '2024-01-15',
      isAdvanced: true,
      status: 'approved',
      submittedAt: '2024-01-15T08:00:00Z',
      approvedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      missionId: '1',
      employeeId: '1',
      employeeName: 'Carlos Santos',
      category: 'accommodation',
      description: 'Hotel Ibis São Paulo',
      amount: 150.00,
      date: '2024-01-15',
      isAdvanced: true,
      status: 'pending',
      submittedAt: '2024-01-15T18:00:00Z'
    },
    {
      id: '3',
      missionId: '2',
      employeeId: '2',
      employeeName: 'João Oliveira',
      category: 'meals',
      description: 'Almoço durante manutenção',
      amount: 45.00,
      date: '2024-01-14',
      isAdvanced: false,
      status: 'reimbursed',
      submittedAt: '2024-01-14T13:00:00Z',
      approvedAt: '2024-01-14T14:00:00Z',
      reimbursedAt: '2024-01-16T09:00:00Z'
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      providerId: '1',
      providerName: 'João Silva - Técnico',
      amount: 2500.00,
      dueDate: '2024-02-01',
      status: 'pending',
      type: 'full',
      description: 'Serviços de instalação - Janeiro 2024',
      notes: 'Pagamento referente às 5 instalações realizadas'
    },
    {
      id: '2',
      providerId: '2',
      providerName: 'Maria Santos - Técnica',
      amount: 1800.00,
      dueDate: '2024-01-28',
      status: 'overdue',
      type: 'full',
      description: 'Serviços de manutenção - Janeiro 2024',
      notes: 'Manutenção preventiva em 8 veículos'
    },
    {
      id: '3',
      providerId: '3',
      providerName: 'Tech Solutions Ltd',
      amount: 4500.00,
      dueDate: '2024-02-05',
      status: 'pending',
      type: 'installment',
      description: 'Desenvolvimento de módulo personalizado',
      installments: 3,
      currentInstallment: 1,
      notes: 'Primeira parcela de 3'
    },
    {
      id: '4',
      providerId: '4',
      providerName: 'Carlos Oliveira - Freelancer',
      amount: 800.00,
      dueDate: '2024-01-25',
      paymentDate: '2024-01-25',
      status: 'completed',
      type: 'advance',
      description: 'Adiantamento para compra de materiais',
      notes: 'Materiais para instalação em Campinas'
    },
    {
      id: '5',
      providerId: '1',
      providerName: 'João Silva - Técnico',
      amount: 1200.00,
      dueDate: '2024-02-10',
      status: 'partial',
      type: 'full',
      description: 'Pagamento parcial - Projeto especial',
      notes: 'Pagamento de 50% do projeto'
    }
  ]);

  // Saldo inicial da empresa
  const INITIAL_BALANCE = 45720;

  // Calcular dados financeiros baseados nas transações e despesas
  const calculateFinancialData = (): FinancialData => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filtrar transações do mês atual
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Incluir despesas aprovadas e reembolsadas no cálculo das despesas mensais
    const monthlyExpenseTransactions = monthlyTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyApprovedExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear &&
               (e.status === 'approved' || e.status === 'reimbursed');
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyExpenses = monthlyExpenseTransactions + monthlyApprovedExpenses;

    // Calcular saldo total: saldo inicial + entradas - saídas - despesas reembolsadas
    const completedTransactionBalance = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 0);

    const reimbursedExpenses = expenses
      .filter(e => e.status === 'reimbursed')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalBalance = INITIAL_BALANCE + completedTransactionBalance - reimbursedExpenses;

    const pendingPayments = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingExpenses = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const approvedExpenses = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingReceivables = receivables
      .filter(r => r.status === 'pending' || r.status === 'overdue')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      transactions,
      payments,
      expenses,
      receivables,
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      pendingPayments,
      pendingExpenses,
      approvedExpenses,
      pendingReceivables
    };
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('Transaction added to financial system:', newTransaction);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setPayments(prev => [newPayment, ...prev]);
    console.log('Payment added to financial system:', newPayment);
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    console.log('Expense added to financial system:', newExpense);

    // Para hospedagem, criar transações tanto para o gasto quanto para o ressarcimento
    if (expenseData.category === 'accommodation' && expenseData.accommodationDetails) {
      const { actualCost, reimbursementAmount, netAmount, outsourcingCompany } = expenseData.accommodationDetails;
      
      // Registrar o gasto inicial da empresa (saída)
      const expenseTransaction = {
        type: 'expense' as const,
        category: 'accommodation' as const,
        amount: actualCost,
        description: `Hospedagem adiantada: ${expenseData.description}`,
        date: expenseData.date,
        method: 'transfer' as const,
        status: 'completed' as const,
        userId: expenseData.employeeId,
        userName: `Adiantamento Hospedagem - ${expenseData.employeeName}`,
        isRecurring: false,
        createdAt: new Date().toISOString()
      };
      addTransaction(expenseTransaction);

      // Registrar o ressarcimento da empresa terceirizada (entrada)
      const reimbursementTransaction = {
        type: 'income' as const,
        category: 'client_payment' as const,
        amount: reimbursementAmount,
        description: `Ressarcimento hospedagem: ${expenseData.description}${outsourcingCompany ? ` - ${outsourcingCompany}` : ''}`,
        date: expenseData.date,
        method: 'transfer' as const,
        status: 'completed' as const,
        userId: expenseData.employeeId,
        userName: `Ressarcimento - ${outsourcingCompany || 'Empresa Terceirizada'}`,
        isRecurring: false,
        createdAt: new Date().toISOString(),
        clientName: outsourcingCompany
      };
      addTransaction(reimbursementTransaction);

      console.log(`Accommodation processed - Cost: ${actualCost}, Reimbursement: ${reimbursementAmount}, Net: ${netAmount}`);
    } else if (expenseData.isAdvanced) {
      // Lógica existente para outros adiantamentos
      const expenseTransaction = {
        type: 'expense' as const,
        category: 'other' as const,
        amount: expenseData.amount,
        description: `Adiantamento: ${expenseData.description}`,
        date: expenseData.date,
        method: 'transfer' as const,
        status: 'completed' as const,
        userId: expenseData.employeeId,
        userName: `Adiantamento - ${expenseData.employeeName}`,
        isRecurring: false,
        createdAt: new Date().toISOString()
      };
      addTransaction(expenseTransaction);
    }
  };

  const addReceivable = (receivableData: Omit<Receivable, 'id'>) => {
    const newReceivable: Receivable = {
      ...receivableData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    setReceivables(prev => [newReceivable, ...prev]);
    console.log('Receivable added to financial system:', newReceivable);
  };

  const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
    setExpenses(prev => prev.map(expense => {
      if (expense.id === expenseId) {
        const updatedExpense = { 
          ...expense, 
          status,
          ...(status === 'approved' && { approvedAt: new Date().toISOString() }),
          ...(status === 'reimbursed' && { reimbursedAt: new Date().toISOString() })
        };

        console.log('Expense status updated:', expenseId, 'New status:', status);
        return updatedExpense;
      }
      return expense;
    }));
  };

  const updateReceivableStatus = (receivableId: string, status: Receivable['status'], receivedDate?: string) => {
    setReceivables(prev => prev.map(r => {
      if (r.id === receivableId) {
        const updatedReceivable = { 
          ...r, 
          status,
          ...(receivedDate && { receivedDate })
        };

        console.log('Receivable status updated:', receivableId, 'New status:', status);
        return updatedReceivable;
      }
      return r;
    }));
  };

  const processReceivablePayment = (receivableId: string) => {
    const receivable = receivables.find(r => r.id === receivableId);
    if (!receivable) return;

    const currentDate = new Date().toISOString().split('T')[0];
    
    updateReceivableStatus(receivableId, 'received', currentDate);

    const receivableTransaction = {
      type: 'income' as const,
      category: 'client_payment' as const,
      amount: receivable.amount,
      description: `Recebimento: ${receivable.description} - Cliente: ${receivable.clientName}`,
      date: currentDate,
      method: 'transfer' as const,
      status: 'completed' as const,
      userId: receivable.userId,
      userName: receivable.userName,
      clientName: receivable.clientName
    };

    addTransaction(receivableTransaction);
    console.log('Receivable payment processed:', receivableId, 'Amount:', receivable.amount);
  };

  const updatePayment = (paymentId: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        const updatedPayment = { ...p, ...updates };
        console.log('Payment updated:', updatedPayment);
        return updatedPayment;
      }
      return p;
    }));
  };

  const updatePaymentStatus = (paymentId: string, status: Payment['status'], paymentDate?: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        const updatedPayment = { 
          ...p, 
          status,
          ...(paymentDate && { paymentDate })
        };

        console.log('Payment status updated:', paymentId, 'New status:', status);

        if (status === 'completed') {
          setTransactions(prevTrans => prevTrans.map(t => {
            if (t.description.includes(`Pagamento agendado: ${p.description}`) || 
                (t.description.includes(p.description) && t.amount === p.amount)) {
              console.log('Transaction updated:', t.id);
              return { ...t, status: 'completed' as const, date: paymentDate || new Date().toISOString().split('T')[0] };
            }
            return t;
          }));
        }

        if (status === 'overdue' || (updatedPayment.dueDate && new Date(updatedPayment.dueDate) < new Date() && status !== 'completed')) {
          return { ...updatedPayment, status: 'overdue' as const };
        }

        return updatedPayment;
      }
      return p;
    }));
  };

  const processPayment = (payment: Payment) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    console.log('Processing payment:', payment.id, 'Amount:', payment.amount);
    
    updatePaymentStatus(payment.id, 'completed', currentDate);

    const existingTransaction = transactions.find(t => 
      (t.description.includes(payment.description) && t.amount === payment.amount) ||
      t.description.includes(`Pagamento agendado: ${payment.description}`)
    );

    if (existingTransaction) {
      setTransactions(prev => prev.map(t => 
        t.id === existingTransaction.id 
          ? { ...t, status: 'completed' as const, date: currentDate, description: `Pagamento realizado: ${payment.description}` }
          : t
      ));
      console.log('Existing transaction updated to completed:', existingTransaction.id);
    } else {
      const paymentTransaction = {
        type: 'expense' as const,
        category: 'service_payment' as const,
        amount: payment.amount,
        description: `Pagamento realizado: ${payment.description}`,
        date: currentDate,
        method: 'transfer' as const,
        status: 'completed' as const,
        userId: '1',
        userName: 'Sistema - Pagamento Manual'
      };

      addTransaction(paymentTransaction);
      console.log('New payment transaction created');
    }
  };

  const processExpenseApproval = (expenseId: string, amount: number, description: string) => {
    console.log('Expense approved:', expenseId, 'Amount:', amount);
    updateExpenseStatus(expenseId, 'approved');

    const expense = expenses.find(e => e.id === expenseId);
    if (expense && !expense.isAdvanced) {
      const approvalTransaction = {
        type: 'expense' as const,
        category: 'other' as const,
        amount: amount,
        description: `Despesa aprovada: ${description}`,
        date: new Date().toISOString().split('T')[0],
        method: 'transfer' as const,
        status: 'pending' as const,
        userId: expense.employeeId,
        userName: `Aprovação - ${expense.employeeName}`
      };
      addTransaction(approvalTransaction);
    }
  };

  const processExpenseReimbursement = (expenseId: string, amount: number, description: string, employeeName: string) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    updateExpenseStatus(expenseId, 'reimbursed');

    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      if (expense.isAdvanced) {
        console.log('Expense reimbursement processed for advance:', expenseId);
      } else {
        setTransactions(prev => prev.map(t => {
          if (t.description.includes(`Despesa aprovada: ${description}`) && t.status === 'pending') {
            return { ...t, status: 'completed' as const, date: currentDate };
          }
          return t;
        }));

        const pendingTransaction = transactions.find(t => 
          t.description.includes(`Despesa aprovada: ${description}`) && t.status === 'pending'
        );
        
        if (!pendingTransaction) {
          const reimbursementTransaction = {
            type: 'expense' as const,
            category: 'other' as const,
            amount: amount,
            description: `Reembolso: ${description}`,
            date: currentDate,
            method: 'transfer' as const,
            status: 'completed' as const,
            userId: expense.employeeId,
            userName: `Reembolso - ${employeeName}`
          };
          addTransaction(reimbursementTransaction);
        }
      }
    }

    console.log('Expense reimbursed:', expenseId, 'Amount:', amount, 'Employee:', employeeName);
  };

  const cancelPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'cancelled' as const } : p
    ));

    setTransactions(prev => prev.map(t => {
      const payment = payments.find(p => p.id === paymentId);
      if (payment && (t.description.includes('Pagamento agendado') || t.description.includes(payment.description)) && 
          t.status === 'pending') {
        console.log('Transaction cancelled:', t.id);
        return { ...t, status: 'cancelled' as const };
      }
      return t;
    }));

    console.log('Payment cancelled:', paymentId);
  };

  // Auto-atualizar status de urgência
  useEffect(() => {
    const today = new Date();
    
    // Atualizar pagamentos em atraso
    setPayments(prev => prev.map(payment => {
      const dueDate = new Date(payment.dueDate);
      if (dueDate < today && payment.status !== 'completed' && payment.status !== 'cancelled' && payment.status !== 'overdue') {
        console.log('Payment marked as overdue:', payment.id);
        return { ...payment, status: 'overdue' as const };
      }
      return payment;
    }));

    // Atualizar recebíveis em atraso
    setReceivables(prev => prev.map(receivable => {
      const expectedDate = new Date(receivable.expectedDate);
      if (expectedDate < today && receivable.status !== 'received' && receivable.status !== 'overdue') {
        console.log('Receivable marked as overdue:', receivable.id);
        return { ...receivable, status: 'overdue' as const };
      }
      return receivable;
    }));
  }, []);

  const getRecentTransactions = (limit = 5) => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getCashFlowProjections = () => {
    const today = new Date();
    const projections = [];

    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expected7DaysIncome = payments
      .filter(p => p.status === 'pending' && new Date(p.dueDate) <= next7Days)
      .reduce((sum, p) => sum + p.amount, 0);

    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expected30DaysIncome = payments
      .filter(p => p.status === 'pending' && new Date(p.dueDate) <= next30Days)
      .reduce((sum, p) => sum + p.amount, 0);

    projections.push({
      period: 'Próximos 7 dias',
      expectedIncome: expected7DaysIncome,
      expectedExpenses: 8300.00,
      netFlow: expected7DaysIncome - 8300.00,
      status: expected7DaysIncome - 8300.00 > 0 ? 'positive' : 'negative'
    });

    projections.push({
      period: 'Próximos 30 dias',
      expectedIncome: expected30DaysIncome,
      expectedExpenses: 38500.00,
      netFlow: expected30DaysIncome - 38500.00,
      status: expected30DaysIncome - 38500.00 > 0 ? 'positive' : 'negative'
    });

    return projections;
  };

  const getExpensesByStatus = (status: Expense['status']) => {
    return expenses.filter(expense => expense.status === status);
  };

  const getReceivablesByStatus = (status: Receivable['status']) => {
    return receivables.filter(receivable => receivable.status === status);
  };

  const data = calculateFinancialData();

  const contextValue: FinancialContextType = {
    data,
    addTransaction,
    addPayment,
    addExpense,
    addReceivable,
    updatePayment,
    updatePaymentStatus,
    updateExpenseStatus,
    updateReceivableStatus,
    processPayment,
    processExpenseApproval,
    processExpenseReimbursement,
    processReceivablePayment,
    cancelPayment,
    getRecentTransactions,
    getCashFlowProjections,
    getExpensesByStatus,
    getReceivablesByStatus
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
