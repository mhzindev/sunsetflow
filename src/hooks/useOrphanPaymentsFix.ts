
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';

export const useOrphanPaymentsFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const { showSuccess, showError } = useToastFeedback();

  const fixOrphanPayments = async () => {
    try {
      setIsFixing(true);
      console.log('Executando correção de pagamentos órfãos...');
      
      const { data, error } = await supabase.rpc('fix_orphan_payments');
      
      if (error) {
        console.error('Erro ao corrigir pagamentos órfãos:', error);
        showError('Erro', 'Falha ao corrigir pagamentos órfãos: ' + error.message);
        return { success: false, error };
      }
      
      console.log('Resultado da correção:', data);
      
      if (data?.success) {
        showSuccess(
          'Correção Concluída', 
          `${data.fixed_count} pagamento(s) órfão(s) foram corrigidos e vinculados aos prestadores corretos.`
        );
        return { success: true, fixedCount: data.fixed_count };
      } else {
        showError('Erro', data?.message || 'Falha na correção de pagamentos órfãos');
        return { success: false, error: data?.message };
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      showError('Erro', 'Erro inesperado ao corrigir pagamentos órfãos');
      return { success: false, error };
    } finally {
      setIsFixing(false);
    }
  };

  return {
    fixOrphanPayments,
    isFixing
  };
};
