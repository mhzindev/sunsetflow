
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { useToastFeedback } from './useToastFeedback';
import type { PendingRevenue } from '@/types/revenue';

export const usePendingRevenuesSecure = () => {
  const [pendingRevenues, setPendingRevenues] = useState<PendingRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isValidated, companyId } = useCompanyIsolation();
  const { showError } = useToastFeedback();

  const fetchPendingRevenues = async () => {
    try {
      setLoading(true);
      
      if (!isValidated || !companyId) {
        console.log('🔒 usePendingRevenuesSecure: Sem acesso à empresa validado');
        setPendingRevenues([]);
        return [];
      }

      console.log('🏢 usePendingRevenuesSecure: Buscando receitas para empresa:', companyId);

      // RLS já filtra automaticamente por company_id
      const { data, error } = await supabase
        .from('pending_revenues')
        .select(`
          *,
          missions:mission_id(title, location)
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar receitas pendentes:', error);
        showError('Erro', 'Erro ao carregar receitas pendentes');
        return [];
      }

      console.log('✅ Receitas pendentes isoladas encontradas:', data?.length || 0);
      setPendingRevenues(data || []);
      return data || [];
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar receitas pendentes:', err);
      setPendingRevenues([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isValidated && companyId) {
      fetchPendingRevenues();
    } else {
      console.log('🔒 usePendingRevenuesSecure: Aguardando validação completa');
      setLoading(false);
    }
  }, [user, isValidated, companyId]);

  return {
    pendingRevenues,
    loading,
    fetchPendingRevenues
  };
};
