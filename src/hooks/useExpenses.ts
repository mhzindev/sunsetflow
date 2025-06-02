
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando despesas via RPC...');
      
      // Usar RPC para evitar problemas de RLS
      const { data, error } = await supabase.rpc('get_user_expenses_simple');

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        throw error;
      }
      
      console.log('Despesas encontradas:', data?.length || 0);
      setExpenses(data || []);
      
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses
  };
};
