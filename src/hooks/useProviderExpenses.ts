
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
  source: 'expenses' | 'transactions';
  isRevenue?: boolean;
}

export const useProviderExpenses = () => {
  const [expenses, setExpenses] = useState<ProviderExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchExpenses, fetchTransactions } = useSupabaseData();
  const { user } = useAuth();

  const loadProviderExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar despesas normais da tabela expenses
      const expensesData = await fetchExpenses();
      
      // 2. Buscar transações de receita de deslocamento/hospedagem do usuário
      const transactionsData = await fetchTransactions();
      const revenueTransactions = transactionsData?.filter(t => 
        t.type === 'income' && 
        (t.category === 'fuel' || t.category === 'accommodation') &&
        t.user_id === user?.id
      ) || [];

      console.log('=== DEBUG: Dados do prestador carregados ===');
      console.log('Despesas normais:', expensesData?.length || 0);
      console.log('Receitas de deslocamento/hospedagem:', revenueTransactions.length);

      // 3. Combinar e mapear os dados
      const combinedExpenses: ProviderExpenseItem[] = [];

      // Adicionar despesas normais
      if (expensesData) {
        expensesData.forEach(expense => {
          combinedExpenses.push({
            id: `expense_${expense.id}`,
            type: expense.category === 'fuel' || expense.category === 'accommodation' ? 'revenue' : 'expense',
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
            status: expense.status,
            mission: expense.missions ? {
              title: expense.missions.title,
              location: expense.missions.location
            } : undefined,
            source: 'expenses',
            isRevenue: expense.category === 'fuel' || expense.category === 'accommodation'
          });
        });
      }

      // Adicionar receitas de transações (apenas se não houver despesa correspondente)
      revenueTransactions.forEach(transaction => {
        // Verificar se já não existe uma despesa com a mesma descrição/categoria
        const existingExpense = combinedExpenses.find(e => 
          e.category === transaction.category && 
          e.date === transaction.date &&
          e.description.includes(transaction.description.split(':')[1]?.trim() || transaction.description)
        );

        if (!existingExpense) {
          combinedExpenses.push({
            id: `transaction_${transaction.id}`,
            type: 'revenue',
            category: transaction.category,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            status: transaction.status,
            source: 'transactions',
            isRevenue: true
          });
        }
      });

      // Ordenar por data (mais recente primeiro)
      combinedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(combinedExpenses);
      console.log('=== DEBUG: Lista combinada final ===');
      console.log('Total de itens:', combinedExpenses.length);
      console.log('Receitas:', combinedExpenses.filter(e => e.isRevenue).length);
      console.log('Despesas:', combinedExpenses.filter(e => !e.isRevenue).length);

    } catch (err: any) {
      console.error('Erro ao carregar despesas do prestador:', err);
      setError(err.message || 'Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProviderExpenses();
    }
  }, [user]);

  return {
    expenses,
    loading,
    error,
    refetch: loadProviderExpenses
  };
};
