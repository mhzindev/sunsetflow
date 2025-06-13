
import { useState, useEffect } from 'react';
import { useSupabaseDataSecure } from './useSupabaseDataSecure';

export const useTransactionsSecure = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchTransactions, hasValidAccess } = useSupabaseDataSecure();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      if (hasValidAccess()) {
        const data = await fetchTransactions();
        setTransactions(data || []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    transactions,
    loading,
    refetch: loadTransactions
  };
};
