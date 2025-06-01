
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
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
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<FinancialData>({
    transactions: [],
    payments: [],
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    if (!isAuthenticated || !user) {
      setData({
        transactions: [],
        payments: [],
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        pendingPayments: 0,
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

      setData({
        transactions,
        payments,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        pendingPayments,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated, user]);

  const value = {
    data,
    isLoading,
    refreshData,
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
