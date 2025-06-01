
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAccounts } from '@/hooks/useAccounts';
import { Transaction, Expense, Payment } from '@/types';

interface FinancialData {
  transactions: Transaction[];
  expenses: Expense[];
  payments: Payment[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  pendingExpenses: number;
  approvedExpenses: number;
  bankBalance: number;
  creditAvailable: number;
  creditUsed: number;
  totalResources: number; // Saldo em conta + limite disponível
}

interface FinancialContextType {
  data: FinancialData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
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
  const { getAccountSummary, loading: accountsLoading } = useAccounts();
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    expenses: [],
    payments: [],
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
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = recentTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calcular pagamentos e despesas pendentes
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingExpenses = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const approvedExpenses = expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);

    // Dados das contas
    const bankBalance = accountSummary.totalBankBalance || 0;
    const creditAvailable = accountSummary.totalCreditAvailable || 0;
    const creditUsed = accountSummary.totalCreditUsed || 0;
    
    // Total de recursos disponíveis (dinheiro em conta + limite disponível)
    const totalResources = bankBalance + creditAvailable;
    
    // Saldo total real (considerando que cartão de crédito é dívida)
    const totalBalance = bankBalance - creditUsed;

    return {
      transactions,
      expenses,
      payments,
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

      const [transactions, expenses, payments] = await Promise.all([
        supabaseData.fetchTransactions(),
        supabaseData.fetchExpenses(),
        supabaseData.fetchPayments()
      ]);

      const accountSummary = getAccountSummary();

      const financialData = calculateFinancialData(
        transactions, 
        expenses, 
        payments, 
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

  useEffect(() => {
    refreshData();
  }, [accountsLoading]); // Recarrega quando as contas terminam de carregar

  const contextValue = {
    data,
    loading: loading || accountsLoading,
    error,
    refreshData
  };

  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};
