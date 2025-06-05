
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from './AuthContext';

interface FinancialData {
  totalBalance: number;
  bankBalance: number;
  creditUsed: number;
  creditAvailable: number;
  totalResources: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  approvedExpenses: number;
  transactions: any[];
  expenses: any[];
  payments: any[];
  accounts: any[];
  loading: boolean;
  error: string | null;
}

const FinancialContext = createContext<{ data: FinancialData; refetch: () => Promise<void> } | undefined>(undefined);

export const FinancialProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'admin' || profile?.user_type === 'admin';
  
  const [data, setData] = useState<FinancialData>({
    totalBalance: 0,
    bankBalance: 0,
    creditUsed: 0,
    creditAvailable: 0,
    totalResources: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    approvedExpenses: 0,
    transactions: [],
    expenses: [],
    payments: [],
    accounts: [],
    loading: true,
    error: null
  });

  const { fetchTransactions, fetchExpenses, fetchPayments, fetchBankAccounts, fetchCreditCards } = useSupabaseData();

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Buscar dados usando a nova função RPC que implementa lógica hierárquica
      const [transactions, expenses, payments, bankAccounts, creditCards] = await Promise.all([
        fetchTransactions(),
        isOwner ? fetchExpenses() : [], // Só buscar despesas se for dono
        isOwner ? fetchPayments() : [], // Só buscar pagamentos se for dono
        isOwner ? fetchBankAccounts() : [], // Só buscar contas se for dono
        isOwner ? fetchCreditCards() : [] // Só buscar cartões se for dono
      ]);

      console.log('=== DEBUG: Dados carregados no FinancialContext ===');
      console.log('Tipo de usuário:', profile?.role, profile?.user_type);
      console.log('É dono?', isOwner);
      console.log('Transações carregadas:', transactions?.length || 0);
      console.log('Despesas carregadas:', expenses?.length || 0);
      console.log('Pagamentos carregados:', payments?.length || 0);

      // Filtrar dados dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions?.filter(t => 
        new Date(t.date) >= thirtyDaysAgo
      ) || [];

      // Calcular receitas e despesas dos últimos 30 dias
      const monthlyIncome = recentTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const monthlyExpenses = recentTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calcular saldos das contas (apenas para donos)
      const bankBalance = bankAccounts?.reduce((sum, account) => 
        sum + (account.balance || 0), 0) || 0;

      const creditUsed = creditCards?.reduce((sum, card) => 
        sum + (card.used_limit || 0), 0) || 0;

      const creditAvailable = creditCards?.reduce((sum, card) => 
        sum + (card.available_limit || 0), 0) || 0;

      const totalResources = bankBalance + creditAvailable;
      const totalBalance = bankBalance - creditUsed;

      // Calcular pendências (apenas para donos)
      const pendingPayments = payments?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const approvedExpenses = expenses?.filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setData({
        totalBalance,
        bankBalance,
        creditUsed,
        creditAvailable,
        totalResources,
        monthlyIncome,
        monthlyExpenses,
        pendingPayments,
        approvedExpenses,
        transactions: transactions || [],
        expenses: expenses || [],
        payments: payments || [],
        accounts: [...(bankAccounts || []), ...(creditCards || [])],
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Erro ao carregar dados financeiros:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Erro ao carregar dados financeiros'
      }));
    }
  };

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  return (
    <FinancialContext.Provider value={{ data, refetch: fetchData }}>
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
