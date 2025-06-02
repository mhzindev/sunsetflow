
import { useEffect, useCallback } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToastFeedback } from './useToastFeedback';

export const useTransactionSync = () => {
  const { fetchTransactions, fetchPayments } = useSupabaseData();
  const { refreshData } = useFinancial();
  const { showError } = useToastFeedback();

  const syncTransactions = useCallback(async () => {
    try {
      console.log('Iniciando sincronização de transações...');
      
      // Buscar transações atualizadas
      const transactions = await fetchTransactions();
      console.log('Transações sincronizadas:', transactions?.length || 0);
      
      // Buscar pagamentos atualizados
      const payments = await fetchPayments();
      console.log('Pagamentos sincronizados:', payments?.length || 0);
      
      // Forçar atualização do contexto financeiro
      await refreshData();
      
      console.log('Sincronização concluída com sucesso');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      showError('Erro de Sincronização', 'Não foi possível sincronizar os dados');
    }
  }, [fetchTransactions, fetchPayments, refreshData, showError]);

  // Sincronizar automaticamente ao carregar
  useEffect(() => {
    syncTransactions();
  }, [syncTransactions]);

  return {
    syncTransactions
  };
};
