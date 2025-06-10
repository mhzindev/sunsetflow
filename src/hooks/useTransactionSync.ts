
import { useEffect, useCallback, useState, useRef } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { useToastFeedback } from './useToastFeedback';

export const useTransactionSync = () => {
  const { fetchTransactions, fetchPayments } = useSupabaseData();
  const { refreshData } = useFinancialSimplified();
  const { showError } = useToastFeedback();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncTransactions = useCallback(async (silent: boolean = false) => {
    // Evitar sincronizações simultâneas
    if (isSyncing) {
      console.log('Sincronização já em andamento, ignorando...');
      return { success: false, error: 'Sync already in progress' };
    }

    // Throttle mais restritivo: 2 minutos para evitar duplicações
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    if (timeSinceLastSync < 120000 && !silent) {
      console.log(`Sync muito recente (${Math.round(timeSinceLastSync/1000)}s atrás), ignorando para evitar duplicações...`);
      return { success: false, error: 'Too soon since last sync' };
    }

    setIsSyncing(true);
    lastSyncRef.current = now;

    try {
      console.log('Iniciando sincronização controlada de transações...');
      
      // Limpar timeout anterior
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      
      // Buscar dados atualizados
      const [transactions, payments] = await Promise.all([
        fetchTransactions(),
        fetchPayments()
      ]);
      
      console.log('Sincronização concluída - Transações:', transactions?.length || 0, 'Pagamentos:', payments?.length || 0);
      
      // Atualizar contexto apenas se necessário
      if (!silent) {
        await refreshData();
      }
      
      console.log('Sincronização controlada concluída com sucesso');
      setRetryCount(0);
      setIsRetrying(false);
      
      return { success: true, data: { transactions, payments } };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      
      // Retry apenas uma vez e com delay maior
      if (!silent && retryCount === 0) {
        console.log('Agendando retry único em 30 segundos...');
        setRetryCount(1);
        setIsRetrying(true);
        
        syncTimeoutRef.current = setTimeout(() => {
          syncTransactions(true);
        }, 30000);
      } else if (!silent) {
        showError('Erro de Sincronização', 'Não foi possível sincronizar os dados');
        setIsRetrying(false);
      }
      
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [fetchTransactions, fetchPayments, refreshData, showError, retryCount, isSyncing]);

  // Auto-sync com intervalo muito maior - 20 minutos
  useEffect(() => {
    // Sync inicial apenas se não estiver em retry
    if (!isRetrying) {
      syncTransactions(true);
    }
    
    // Auto-sync a cada 20 minutos para reduzir carga
    const interval = setInterval(() => {
      if (!isRetrying && !isSyncing) {
        console.log('Sincronização automática (20 minutos)');
        syncTransactions(true);
      }
    }, 1200000); // 20 minutos

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
