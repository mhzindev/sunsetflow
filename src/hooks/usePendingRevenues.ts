
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastFeedback } from './useToastFeedback';
import type { PendingRevenue } from '@/types/revenue';

export const usePendingRevenues = () => {
  const [pendingRevenues, setPendingRevenues] = useState<PendingRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useToastFeedback();

  const fetchPendingRevenues = async () => {
    try {
      setLoading(true);
      console.log('Buscando receitas pendentes...');

      const { data, error } = await supabase
        .from('pending_revenues')
        .select(`
          *,
          missions:mission_id(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas pendentes:', error);
        return [];
      }

      console.log('Receitas pendentes encontradas:', data?.length || 0);
      setPendingRevenues(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar receitas pendentes:', err);
      setPendingRevenues([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const convertToConfirmed = async (
    pendingRevenueId: string,
    accountId: string,
    accountType: 'bank_account' | 'credit_card',
    paymentMethod: string = 'transfer'
  ) => {
    try {
      console.log('=== CONVERTENDO RECEITA PENDENTE PARA CONFIRMADA ===');
      console.log('ID da receita:', pendingRevenueId);
      console.log('Conta:', { accountId, accountType, paymentMethod });

      const { data, error } = await supabase.rpc('convert_pending_to_confirmed_revenue', {
        pending_revenue_id: pendingRevenueId,
        account_id: accountId,
        account_type: accountType,
        payment_method: paymentMethod
      });

      if (error) {
        console.error('Erro RPC ao converter receita:', error);
        showError('Erro', error.message);
        return { success: false, error: error.message };
      }

      console.log('Resultado da conversão RPC:', data);

      if (data?.success) {
        const valorTotal = data.total_amount || 0;
        showSuccess(
          'Sucesso', 
          `Receita de R$ ${valorTotal.toFixed(2)} confirmada! A receita foi registrada e os pagamentos dos prestadores foram criados automaticamente.`
        );
        await fetchPendingRevenues();
        return { success: true, data };
      } else {
        showError('Erro', data?.message || 'Erro ao converter receita');
        return { success: false, error: data?.message };
      }
    } catch (err) {
      console.error('Erro ao converter receita:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showError('Erro', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const cancelPendingRevenue = async (pendingRevenueId: string) => {
    try {
      console.log('Cancelando receita pendente:', pendingRevenueId);

      const { error } = await supabase
        .from('pending_revenues')
        .update({ status: 'cancelled' })
        .eq('id', pendingRevenueId);

      if (error) {
        console.error('Erro ao cancelar receita:', error);
        showError('Erro', error.message);
        return { success: false, error: error.message };
      }

      showSuccess('Sucesso', 'Receita pendente cancelada com sucesso!');
      await fetchPendingRevenues();
      return { success: true };
    } catch (err) {
      console.error('Erro ao cancelar receita:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showError('Erro', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingRevenues();
    }
  }, [user]);

  return {
    pendingRevenues,
    loading,
    fetchPendingRevenues,
    convertToConfirmed,
    cancelPendingRevenue
  };
};
