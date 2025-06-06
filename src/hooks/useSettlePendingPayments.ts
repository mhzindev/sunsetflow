
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';

export const useSettlePendingPayments = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastFeedback();

  const settlePendingPayments = async (providerId: string, settlementAmount: number, paymentDate?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('manually_settle_pending_payments', {
        p_provider_id: providerId,
        p_settlement_amount: settlementAmount,
        p_payment_date: paymentDate || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Erro ao liquidar pagamentos:', error);
        showError('Erro', 'Erro ao liquidar pagamentos pendentes');
        return { success: false, error: error.message };
      }

      if (data?.success) {
        showSuccess('Sucesso', `${data.settled_count} pagamentos liquidados com sucesso`);
        return { success: true, data };
      } else {
        showError('Erro', data?.message || 'Erro ao liquidar pagamentos');
        return { success: false, error: data?.message };
      }
    } catch (error) {
      console.error('Erro ao liquidar pagamentos:', error);
      showError('Erro', 'Erro inesperado ao liquidar pagamentos');
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  const checkPendingPaymentsTotal = async (providerId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('provider_id', providerId)
        .eq('status', 'pending')
        .neq('type', 'balance_payment');

      if (error) {
        console.error('Erro ao verificar pagamentos pendentes:', error);
        return 0;
      }

      return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    } catch (error) {
      console.error('Erro ao verificar pagamentos pendentes:', error);
      return 0;
    }
  };

  return {
    settlePendingPayments,
    checkPendingPaymentsTotal,
    loading
  };
};
