
import { useEffect, useCallback, useState, useRef } from 'react';
import { useSupabaseDataSimplified } from './useSupabaseDataSimplified';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { useToastFeedback } from './useToastFeedback';

export const useTransactionSync = () => {
  const { fetchTransactions, fetchPayments } = useSupabaseDataSimplified();
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

    // Throttle aumentado para 5 minutos para reduzir carga
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    if (timeSinceLastSync < 300000 && !silent) {
      console.log(`Sync muito recente (${Math.round(timeSinceLastSync/1000)}s atrás), ignorando para melhorar performance...`);
      return { success: false, error: 'Too soon since last sync' };
    }

    setIsSyncing(true);
    lastSyncRef.current = now;

    try {
      console.log('Iniciando sincronização otimizada de transações...');
      
      // Limpar timeout anterior
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      
      // Buscar dados atualizados com timeout reduzido
      const [transactions, payments] = await Promise.all([
        fetchTransactions(),
        fetchPayments()
      ]);
      
      console.log('Sincronização concluída - Transações:', transactions?.length || 0, 'Pagamentos:', payments?.length || 0);
      
      // Atualizar contexto apenas se necessário
      if (!silent) {
        await refreshData();
      }
      
      console.log('Sincronização otimizada concluída com sucesso');
      setRetryCount(0);
      setIsRetrying(false);
      
      return { success: true, data: { transactions, payments } };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      
      // Retry apenas uma vez e com delay maior
      if (!silent && retryCount === 0) {
        console.log('Agendando retry único em 60 segundos...');
        setRetryCount(1);
        setIsRetrying(true);
        
        syncTimeoutRef.current = setTimeout(() => {
          syncTransactions(true);
        }, 60000); // Aumentado para 60 segundos
      } else if (!silent) {
        showError('Erro de Sincronização', 'Não foi possível sincronizar os dados');
        setIsRetrying(false);
      }
      
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [fetchTransactions, fetchPayments, refreshData, showError, retryCount, isSyncing]);

  // Auto-sync com intervalo muito maior - 30 minutos para reduzir carga drasticamente
  useEffect(() => {
    // Sync inicial apenas se não estiver em retry
    if (!isRetrying) {
      syncTransactions(true);
    }
    
    // Auto-sync a cada 30 minutos para reduzir carga significativamente
    const interval = setInterval(() => {
      if (!isRetrying && !isSyncing) {
        console.log('Sincronização automática otimizada (30 minutos)');
        syncTransactions(true);
      }
    }, 1800000); // 30 minutos

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
