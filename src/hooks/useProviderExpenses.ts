
import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

interface ProviderExpenseItem {
  id: string;
  type: 'expense' | 'revenue';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  mission?: {
    title?: string;
    location?: string;
  };
  receipt?: string;
  isAdvanced?: boolean;
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
  };
  travelDetails?: {
    kilometers: number;
    ratePerKm: number;
    totalRevenue: number;
  };
}

export const useProviderExpenses = () => {
  const [expenses, setExpenses] = useState<ProviderExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchExpenses, fetchTransactions } = useSupabaseData();
  const { user, profile } = useAuth();

  const isProvider = profile?.user_type === 'provider';

  useEffect(() => {
    if (isProvider && user) {
      loadProviderExpenses();
    } else {
      setExpenses([]);
      setLoading(false);
    }
  }, [isProvider, user]);

  const loadProviderExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar despesas normais do usuário
      const expensesData = await fetchExpenses();
      const userExpenses = expensesData.filter((expense: any) => 
        expense.user_id === user?.id || expense.employee_id === user?.id
      );

      // Buscar transações de receita relacionadas ao usuário (deslocamento/hospedagem)
      const transactionsData = await fetchTransactions();
      const userRevenues = transactionsData.filter((transaction: any) => 
        transaction.user_id === user?.id && 
        transaction.type === 'income' && 
        (transaction.category === 'fuel' || transaction.category === 'accommodation')
      );

      console.log('Despesas do prestador:', userExpenses);
      console.log('Receitas do prestador:', userRevenues);

      // Converter despesas para o formato unificado
      const formattedExpenses: ProviderExpenseItem[] = userExpenses.map((expense: any) => ({
        id: expense.id,
        type: 'expense' as const,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        status: expense.status,
        mission: expense.missions ? {
          title: expense.missions.title,
          location: expense.missions.location
        } : undefined,
        receipt: expense.receipt,
        isAdvanced: expense.is_advanced,
        accommodationDetails: expense.accommodation_details,
        travelDetails: expense.travel_km ? {
          kilometers: expense.travel_km,
          ratePerKm: expense.travel_km_rate,
          totalRevenue: expense.travel_total_value
        } : undefined
      }));

      // Converter receitas para o formato unificado
      const formattedRevenues: ProviderExpenseItem[] = userRevenues.map((transaction: any) => ({
        id: transaction.id,
        type: 'revenue' as const,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        status: transaction.status,
        mission: transaction.mission_id ? {
          title: `Missão ${transaction.mission_id.slice(0, 8)}`,
          location: 'N/A'
        } : undefined,
        receipt: transaction.receipt
      }));

      // Combinar e ordenar por data
      const allItems = [...formattedExpenses, ...formattedRevenues]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(allItems);
    } catch (error: any) {
      console.error('Erro ao carregar despesas do prestador:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    if (isProvider && user) {
      loadProviderExpenses();
    }
  };

  return {
    expenses,
    loading,
    error,
    refresh,
    isProvider
  };
};
