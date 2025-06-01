import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { Payment } from '@/types/payment';

interface FinancialData {
  transactions: Transaction[];
  payments: Payment[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
}

interface FinancialContextType {
  data: FinancialData;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  updatePaymentStatus: (paymentId: string, status: Payment['status'], paymentDate?: string) => void;
  processPayment: (payment: Payment) => void;
  processExpenseApproval: (expenseId: string, amount: number, description: string) => void;
  processExpenseReimbursement: (expenseId: string, amount: number, description: string, employeeName: string) => void;
  cancelPayment: (paymentId: string) => void;
  getRecentTransactions: (limit?: number) => Transaction[];
  getCashFlowProjections: () => any[];
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
  const [payments, setPayments] = useState<Payment[]>([
    // Pagamentos de exemplo para demonstrar o funcionamento
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

  // Calcular dados financeiros baseados nas transações
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

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular saldo total: saldo inicial + todas as entradas - todas as saídas completadas
    const totalBalance = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, INITIAL_BALANCE);

    const pendingPayments = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      transactions,
      payments,
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      pendingPayments
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

    // Se o pagamento é agendado (status pending), criar uma transação pendente
    if (paymentData.status === 'pending') {
      const paymentTransaction = {
        type: 'expense' as const,
        category: 'service_payment' as const,
        amount: paymentData.amount,
        description: `Pagamento agendado: ${paymentData.description}`,
        date: paymentData.dueDate,
        method: 'transfer' as const,
        status: 'pending' as const,
        userId: '1',
        userName: 'Sistema - Pagamento Agendado'
      };

      addTransaction(paymentTransaction);
    }
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

        // Quando um pagamento é marcado como concluído, atualizar a transação correspondente
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

        // Atualizar urgência baseada na nova data de vencimento ou status
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
    
    // Atualizar status do pagamento para concluído
    updatePaymentStatus(payment.id, 'completed', currentDate);

    // Verificar se já existe uma transação relacionada
    const existingTransaction = transactions.find(t => 
      (t.description.includes(payment.description) && t.amount === payment.amount) ||
      t.description.includes(`Pagamento agendado: ${payment.description}`)
    );

    if (existingTransaction) {
      // Atualizar transação existente para concluída
      setTransactions(prev => prev.map(t => 
        t.id === existingTransaction.id 
          ? { ...t, status: 'completed' as const, date: currentDate, description: `Pagamento realizado: ${payment.description}` }
          : t
      ));
      console.log('Existing transaction updated to completed:', existingTransaction.id);
    } else {
      // Criar nova transação de despesa
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
    // Lógica adicional para aprovação pode ser adicionada aqui
  };

  const processExpenseReimbursement = (expenseId: string, amount: number, description: string, employeeName: string) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Criar transação de reembolso
    const reimbursementTransaction = {
      type: 'expense' as const,
      category: 'other' as const,
      amount: amount,
      description: `Reembolso para ${employeeName}: ${description}`,
      date: currentDate,
      method: 'transfer' as const,
      status: 'completed' as const,
      userId: '1',
      userName: 'Sistema - Reembolso'
    };

    addTransaction(reimbursementTransaction);
    console.log('Expense reimbursed:', expenseId, 'Amount:', amount, 'Employee:', employeeName);
  };

  const cancelPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status: 'cancelled' as const } : p
    ));

    // Cancelar transação relacionada
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

  // Atualizar status de urgência automaticamente
  useEffect(() => {
    const today = new Date();
    setPayments(prev => prev.map(payment => {
      const dueDate = new Date(payment.dueDate);
      if (dueDate < today && payment.status !== 'completed' && payment.status !== 'cancelled' && payment.status !== 'overdue') {
        console.log('Payment marked as overdue:', payment.id);
        return { ...payment, status: 'overdue' as const };
      }
      return payment;
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

    // Próximos 7 dias
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expected7DaysIncome = payments
      .filter(p => p.status === 'pending' && new Date(p.dueDate) <= next7Days)
      .reduce((sum, p) => sum + p.amount, 0);

    // Próximos 30 dias
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

  const data = calculateFinancialData();

  const contextValue: FinancialContextType = {
    data,
    addTransaction,
    addPayment,
    updatePayment,
    updatePaymentStatus,
    processPayment,
    processExpenseApproval,
    processExpenseReimbursement,
    cancelPayment,
    getRecentTransactions,
    getCashFlowProjections
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
