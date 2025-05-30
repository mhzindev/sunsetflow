
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
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
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
  const [payments, setPayments] = useState<Payment[]>([]);

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

    const totalBalance = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
      }, 45720); // Saldo inicial

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
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('Transaction added to financial system:', newTransaction);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
    };
    setPayments(prev => [newPayment, ...prev]);
    console.log('Payment added to financial system:', newPayment);
  };

  const updatePaymentStatus = (paymentId: string, status: Payment['status']) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, status } : p
    ));
  };

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

    projections.push({
      period: 'Próximos 7 dias',
      expectedIncome: expected7DaysIncome,
      expectedExpenses: 8300.00,
      netFlow: expected7DaysIncome - 8300.00,
      status: expected7DaysIncome - 8300.00 > 0 ? 'positive' : 'negative'
    });

    // Próximos 30 dias
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expected30DaysIncome = payments
      .filter(p => p.status === 'pending' && new Date(p.dueDate) <= next30Days)
      .reduce((sum, p) => sum + p.amount, 0);

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
    updatePaymentStatus,
    getRecentTransactions,
    getCashFlowProjections
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
