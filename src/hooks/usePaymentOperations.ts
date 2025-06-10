
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';
import { useCompanyIsolation } from './useCompanyIsolation';

export const usePaymentOperations = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastFeedback();
  const { ensureCompanyData, isValidated } = useCompanyIsolation();

  const createPayment = async (paymentData: any) => {
    if (!isValidated) {
      showError('Erro de Acesso', 'Acesso à empresa não validado');
      return null;
    }

    try {
      setLoading(true);

      // Garantir que o company_id seja incluído
      const dataWithCompany = ensureCompanyData(paymentData);

      const { data, error } = await supabase
        .from('payments')
        .insert([dataWithCompany])
        .select()
        .single();

      if (error) throw error;

      showSuccess('Sucesso', 'Pagamento criado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      showError('Erro', 'Erro ao criar pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (paymentId: string, updates: any) => {
    if (!isValidated) {
      showError('Erro de Acesso', 'Acesso à empresa não validado');
      return null;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('update_payment_safe', {
        payment_id: paymentId,
        payment_updates: updates
      });

      if (error) throw error;

      if (data.success) {
        showSuccess('Sucesso', 'Pagamento atualizado com sucesso');
        return data.payment;
      } else {
        showError('Erro', data.message || 'Erro ao atualizar pagamento');
        return null;
      }
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      showError('Erro', 'Erro ao atualizar pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    updatePayment,
    loading
  };
};
