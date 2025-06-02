
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFinancialSummary = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    incomeChange: 0,
    expenseChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando resumo financeiro via RPC...');
      
      // Usar RPC para evitar problemas de RLS
      const { data, error } = await supabase.rpc('get_financial_summary');

      if (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const summaryData = data[0];
        setSummary({
          totalIncome: summaryData.total_income || 0,
          totalExpenses: summaryData.total_expenses || 0,
          monthlyIncome: summaryData.monthly_income || 0,
          monthlyExpenses: summaryData.monthly_expenses || 0,
          incomeChange: summaryData.income_change || 0,
          expenseChange: summaryData.expense_change || 0
        });
      } else {
        // Fallback: buscar dados das transações diretamente via RPC
        const { data: transactions } = await supabase.rpc('get_user_transactions_simple');
        
        if (transactions) {
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          let totalIncome = 0;
          let totalExpenses = 0;
          let monthlyIncome = 0;
          let monthlyExpenses = 0;
          
          transactions.forEach((transaction: any) => {
            const amount = parseFloat(transaction.amount) || 0;
            const transactionDate = new Date(transaction.date);
            
            if (transaction.type === 'income') {
              totalIncome += amount;
              if (transactionDate >= thirtyDaysAgo) {
                monthlyIncome += amount;
              }
            } else if (transaction.type === 'expense') {
              totalExpenses += amount;
              if (transactionDate >= thirtyDaysAgo) {
                monthlyExpenses += amount;
              }
            }
          });
          
          setSummary({
            totalIncome,
            totalExpenses,
            monthlyIncome,
            monthlyExpenses,
            incomeChange: 8.7, // Placeholder - seria calculado com dados históricos
            expenseChange: -2.9 // Placeholder - seria calculado com dados históricos
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar resumo financeiro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: fetchFinancialSummary
  };
};
