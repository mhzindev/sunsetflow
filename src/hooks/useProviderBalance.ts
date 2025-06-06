
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';

export const useProviderBalance = (providerId?: string) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastFeedback();

  const fetchBalance = async () => {
    if (!providerId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_providers')
        .select('current_balance')
        .eq('id', providerId)
        .single();

      if (error) {
        console.error('Erro ao buscar saldo:', error);
        return;
      }

      setBalance(data?.current_balance || 0);
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateBalance = async () => {
    if (!providerId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('recalculate_provider_balance', {
        provider_uuid: providerId
      });

      if (error) {
        console.error('Erro ao recalcular saldo:', error);
        showError('Erro', 'Erro ao recalcular saldo');
        return;
      }

      setBalance(data || 0);
      showSuccess('Sucesso', 'Saldo recalculado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      showError('Erro', 'Erro ao recalcular saldo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchBalance();
    }
  }, [providerId]);

  return {
    balance,
    loading,
    fetchBalance,
    recalculateBalance
  };
};
