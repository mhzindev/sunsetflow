
import { useEffect, useCallback, useState } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToastFeedback } from './useToastFeedback';

export const useTransactionSync = () => {
  const { fetchTransactions, fetchPayments } = useSupabaseData();
  const { refreshData } = useFinancial();
  const { showError } = useToastFeedback();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const syncTransactions = useCallback(async (silent: boolean = false) => {
    try {
      console.log('Iniciando sincronização de transações...');
      
      // Buscar transações atualizadas com retry
      const transactions = await fetchTransactions();
      console.log('Transações sincronizadas:', transactions?.length || 0);
      
      // Buscar pagamentos atualizados
      const payments = await fetchPayments();
      console.log('Pagamentos sincronizados:', payments?.length || 0);
      
      // Forçar atualização do contexto financeiro apenas se necessário
      if (!silent) {
        await refreshData();
      }
      
      console.log('Sincronização concluída com sucesso');
      setRetryCount(0); // Reset retry count on success
      setIsRetrying(false);
      
      return { success: true, data: { transactions, payments } };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      
      if (!silent && retryCount < 3) {
        console.log(`Tentando novamente... (tentativa ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);
        
        // Retry com delay exponencial
        setTimeout(() => {
          syncTransactions(true);
        }, Math.pow(2, retryCount) * 1000);
      } else if (!silent) {
        showError('Erro de Sincronização', 'Não foi possível sincronizar os dados após várias tentativas');
        setIsRetrying(false);
      }
      
      return { success: false, error };
    }
  }, [fetchTransactions, fetchPayments, refreshData, showError, retryCount]);

  // Auto-sync com intervalo MUITO maior - apenas 5 minutos
  useEffect(() => {
    syncTransactions(true); // Initial sync (silent)
    
    // Sync a cada 5 minutos (300 segundos) se não estiver fazendo retry
    const interval = setInterval(() => {
      if (!isRetrying) {
        console.log('Sincronização automática (5 minutos)');
        syncTransactions(true);
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [syncTransactions, isRetrying]);

  return {
    syncTransactions,
    isRetrying,
    retryCount
  };
};
