
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TravelExpense {
  id: string;
  mission_id: string | null;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  employee_name: string;
  employee_role: string | null;
  created_at: string;
  mission_title: string | null;
  mission_location: string | null;
}

export const useTravelExpenses = () => {
  const [expenses, setExpenses] = useState<TravelExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando despesas de viagem...');
      
      // Tentar usar a RPC primeiro
      const { data, error: rpcError } = await supabase.rpc('get_travel_expenses');

      if (rpcError) {
        console.warn('RPC get_travel_expenses falhou, tentando busca direta:', rpcError);
        
        // Fallback: buscar diretamente da tabela expenses
        const { data: expensesData, error: directError } = await supabase
          .from('expenses')
          .select(`
            id,
            mission_id,
            category,
            description,
            amount,
            date,
            status,
            employee_name,
            employee_role,
            created_at,
            missions:mission_id(
              title,
              location
            )
          `)
          .order('created_at', { ascending: false });

        if (directError) {
          console.error('Erro ao buscar despesas diretamente:', directError);
          setExpenses([]);
        } else {
          // Transformar os dados para o formato esperado
          const transformedData = expensesData?.map(expense => ({
            ...expense,
            mission_title: expense.missions ? (expense.missions as any)?.title || null : null,
            mission_location: expense.missions ? (expense.missions as any)?.location || null : null,
            missions: undefined // Remove a propriedade aninhada
          })) || [];
          
          console.log('Despesas encontradas via busca direta:', transformedData.length);
          setExpenses(transformedData);
        }
      } else {
        console.log('Despesas de viagem encontradas via RPC:', data?.length || 0);
        setExpenses(data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar despesas de viagem:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses
  };
};
