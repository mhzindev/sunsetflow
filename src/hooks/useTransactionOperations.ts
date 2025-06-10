
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';
import { useCompanyIsolation } from './useCompanyIsolation';

export const useTransactionOperations = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastFeedback();
  const { ensureCompanyData, isValidated } = useCompanyIsolation();

  const createTransaction = async (transactionData: any) => {
    if (!isValidated) {
      showError('Erro de Acesso', 'Acesso à empresa não validado');
      return null;
    }

    try {
      setLoading(true);

      // Garantir que o company_id seja incluído
      const dataWithCompany = ensureCompanyData(transactionData);

      const { data, error } = await supabase.rpc('insert_transaction_with_casting', {
        p_type: dataWithCompany.type,
        p_category: dataWithCompany.category,
        p_amount: dataWithCompany.amount,
        p_description: dataWithCompany.description,
        p_date: dataWithCompany.date,
        p_method: dataWithCompany.method,
        p_status: dataWithCompany.status,
        p_user_id: dataWithCompany.user_id,
        p_user_name: dataWithCompany.user_name,
        p_mission_id: dataWithCompany.mission_id || null,
        p_receipt: dataWithCompany.receipt || null,
        p_tags: dataWithCompany.tags || null,
        p_account_id: dataWithCompany.account_id || null,
        p_account_type: dataWithCompany.account_type || null
      });

      if (error) throw error;

      showSuccess('Sucesso', 'Transação criada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      showError('Erro', 'Erro ao criar transação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransaction,
    loading
  };
};
