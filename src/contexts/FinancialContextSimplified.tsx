
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useSupabaseDataSimplified } from '@/hooks/useSupabaseDataSimplified';

interface FinancialData {
  totalBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  pendingPayments: number;
  transactions: any[];
  expenses: any[];
  payments: any[];
  accounts: any[];
  loading: boolean;
  error: string | null;
}

interface FinancialContextType {
  data: FinancialData;
  refreshData: () => void;
}

const FinancialContextSimplified = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProviderSimplified = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('FinancialProviderSimplified: Estado atual:', {
    profile: !!profile,
    authLoading,
    companyId: profile?.company_id
  });

  const {
    transactions = [],
    expenses = [],
    payments = [],
    accounts = [],
    loading: dataLoading,
    error: dataError,
    refetch
  } = useSupabaseDataSimplified();

  useEffect(() => {
    if (!authLoading) {
      setLoading(dataLoading);
      setError(dataError);
    }
  }, [authLoading, dataLoading, dataError]);

  const calculateTotals = () => {
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = expenses
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const accountBalances = accounts
      .reduce((sum, a) => sum + (a.balance || 0), 0);

    return {
      totalRevenue,
      totalExpenses,
      pendingPayments,
      totalBalance: accountBalances
    };
  };

  const totals = calculateTotals();

  const data: FinancialData = {
    ...totals,
    transactions,
    expenses,
    payments,
    accounts,
    loading,
    error
  };

  const refreshData = () => {
    refetch();
  };

  const value = {
    data,
    refreshData
  };

  return (
    <FinancialContextSimplified.Provider value={value}>
      {children}
    </FinancialContextSimplified.Provider>
  );
};

export const useFinancialSimplified = () => {
  const context = useContext(FinancialContextSimplified);
  if (!context) {
    throw new Error('useFinancialSimplified must be used within a FinancialProviderSimplified');
  }
  return context;
};
