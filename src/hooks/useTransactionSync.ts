
import { useEffect, useCallback, useState, useRef } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToastFeedback } from './useToastFeedback';

export const useTransactionSync = () => {
  const { fetchTransactions, fetchPayments } = useSupabaseData();
  const { refreshData } = useFinancial();
  const { showError } = useToastFeedback();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef<number>(0);

  const syncTransactions = useCallback(async (silent: boolean = false) => {
    // Evitar sincronizações simultâneas
    if (isSyncing) {
      console.log('Sincronização já em andamento, ignorando...');
      return { success: false, error: 'Sync already in progress' };
    }

    // Throttle: evitar sync muito frequente (mínimo 30 segundos)
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    if (timeSinceLastSync < 30000 && !silent) {
      console.log(`Sync muito recente (${Math.round(timeSinceLastSync/1000)}s atrás), ignorando...`);
      return { success: false, error: 'Too soon since last sync' };
    }

    setIsSyncing(true);
    lastSyncRef.current = now;

    try {
      console.log('Iniciando sincronização de transações...');
      
      // Buscar transações atualizadas com retry limitado
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
      
      if (!silent && retryCount < 2) { // Reduzido de 3 para 2 tentativas
        console.log(`Tentando novamente... (tentativa ${retryCount + 1}/2)`);
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);
        
        // Retry com delay exponencial (máximo 8 segundos)
        setTimeout(() => {
          syncTransactions(true);
        }, Math.min(Math.pow(2, retryCount) * 2000, 8000));
      } else if (!silent) {
        showError('Erro de Sincronização', 'Não foi possível sincronizar os dados');
        setIsRetrying(false);
      }
      
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [fetchTransactions, fetchPayments, refreshData, showError, retryCount, isSyncing]);

  // Auto-sync com intervalo MUITO maior - 10 minutos
  useEffect(() => {
    // Initial sync apenas se não estiver fazendo retry
    if (!isRetrying) {
      syncTransactions(true);
    }
    
    // Sync a cada 10 minutos (600 segundos) se não estiver fazendo retry ou sync
    const interval = setInterval(() => {
      if (!isRetrying && !isSyncing) {
        console.log('Sincronização automática (10 minutos)');
        syncTransactions(true);
      }
    }, 600000); // 10 minutos

    return () => clearInterval(interval);
  }, [syncTransactions, isRetrying, isSyncing]);

  return {
    syncTransactions,
    isRetrying,
    retryCount,
    isSyncing
  };
};
