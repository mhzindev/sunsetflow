
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
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncTransactions = useCallback(async (silent: boolean = false) => {
    // Evitar sincronizações simultâneas ou muito frequentes
    if (isSyncing) {
      console.log('Sincronização já em andamento, ignorando...');
      return { success: false, error: 'Sync already in progress' };
    }

    // Throttle: evitar sync muito frequente (mínimo 60 segundos para evitar duplicações)
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    if (timeSinceLastSync < 60000 && !silent) {
      console.log(`Sync muito recente (${Math.round(timeSinceLastSync/1000)}s atrás), ignorando para evitar duplicações...`);
      return { success: false, error: 'Too soon since last sync' };
    }

    setIsSyncing(true);
    lastSyncRef.current = now;

    try {
      console.log('Iniciando sincronização única de transações...');
      
      // Limpar timeout anterior se existir
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      
      // Buscar transações atualizadas com retry limitado
      const transactions = await fetchTransactions();
      console.log('Transações sincronizadas (único):', transactions?.length || 0);
      
      // Buscar pagamentos atualizados
      const payments = await fetchPayments();
      console.log('Pagamentos sincronizados (único):', payments?.length || 0);
      
      // Forçar atualização do contexto financeiro apenas se necessário
      if (!silent) {
        await refreshData();
      }
      
      console.log('Sincronização única concluída com sucesso');
      setRetryCount(0); // Reset retry count on success
      setIsRetrying(false);
      
      return { success: true, data: { transactions, payments } };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      
      if (!silent && retryCount < 1) { // Reduzido para apenas 1 retry para evitar duplicações
        console.log(`Tentando novamente... (tentativa ${retryCount + 1}/1)`);
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);
        
        // Retry com delay maior (10 segundos) para evitar conflitos
        syncTimeoutRef.current = setTimeout(() => {
          syncTransactions(true);
        }, 10000);
      } else if (!silent) {
        showError('Erro de Sincronização', 'Não foi possível sincronizar os dados');
        setIsRetrying(false);
      }
      
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [fetchTransactions, fetchPayments, refreshData, showError, retryCount, isSyncing]);

  // Auto-sync com intervalo MUITO maior - 15 minutos para evitar duplicações
  useEffect(() => {
    // Initial sync apenas se não estiver fazendo retry
    if (!isRetrying) {
      syncTransactions(true);
    }
    
    // Sync a cada 15 minutos (900 segundos) se não estiver fazendo retry ou sync
    const interval = setInterval(() => {
      if (!isRetrying && !isSyncing) {
        console.log('Sincronização automática (15 minutos)');
        syncTransactions(true);
      }
    }, 900000); // 15 minutos

    return () => {
      clearInterval(interval);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncTransactions, isRetrying, isSyncing]);

  return {
    syncTransactions,
    isRetrying,
    retryCount,
    isSyncing
  };
};
