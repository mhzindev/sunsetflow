
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyIsolationOptimized } from './useCompanyIsolationOptimized';

export const useSupabaseDataSimplified = () => {
  const { profile } = useAuth();
  const { companyId, isValidated } = useCompanyIsolationOptimized();
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isValidated || !companyId) {
      console.log('useSupabaseDataSimplified: Aguardando validação ou company_id', { isValidated, companyId });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useSupabaseDataSimplified: Buscando dados para empresa:', companyId);

      // Buscar transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
      } else {
        setTransactions(transactionsData || []);
      }

      // Buscar despesas
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (expensesError) {
        console.error('Erro ao buscar despesas:', expensesError);
      } else {
        setExpenses(expensesData || []);
      }

      // Buscar pagamentos (apenas para admins)
      if (profile?.role === 'admin') {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (paymentsError) {
          console.error('Erro ao buscar pagamentos:', paymentsError);
        } else {
          setPayments(paymentsData || []);
        }
      }

      // Buscar contas (apenas para admins)
      if (profile?.role === 'admin') {
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (accountsError) {
          console.error('Erro ao buscar contas:', accountsError);
        } else {
          setAccounts(accountsData || []);
        }
      }

      console.log('useSupabaseDataSimplified: Dados carregados com sucesso');

    } catch (err) {
      console.error('useSupabaseDataSimplified: Erro inesperado:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, isValidated, profile?.role]);

  const refetch = () => {
    fetchData();
  };

  return {
    transactions,
    expenses,
    payments,
    accounts,
    loading,
    error,
    refetch
  };
};
