
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToastFeedback } from './useToastFeedback';
import type { ConfirmedRevenue } from '@/types/revenue';

export const useConfirmedRevenues = () => {
  const [confirmedRevenues, setConfirmedRevenues] = useState<ConfirmedRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastFeedback();

  const fetchConfirmedRevenues = async () => {
    try {
      setLoading(true);
      console.log('Buscando receitas confirmadas...');

      const { data, error } = await supabase
        .from('confirmed_revenues')
        .select(`
          *,
          missions:mission_id(title, location)
        `)
        .order('received_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas confirmadas:', error);
        return [];
      }

      console.log('Receitas confirmadas encontradas:', data?.length || 0);
      setConfirmedRevenues(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar receitas confirmadas:', err);
      setConfirmedRevenues([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConfirmedRevenues();
    }
  }, [user]);

  return {
    confirmedRevenues,
    loading,
    fetchConfirmedRevenues
  };
};
