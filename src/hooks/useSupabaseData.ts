import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar transações
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao buscar transações');
      return [];
    }
  };

  // Função para buscar despesas
  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          missions:mission_id(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      setError('Erro ao buscar despesas');
      return [];
    }
  };

  // Função para buscar pagamentos
  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          service_providers:provider_id(name, email, phone, service)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
      setError('Erro ao buscar pagamentos');
      return [];
    }
  };

  // Função para buscar missões
  const fetchMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar missões:', err);
      setError('Erro ao buscar missões');
      return [];
    }
  };

  // Função para buscar fornecedores
  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      setError('Erro ao buscar fornecedores');
      return [];
    }
  };

  // Função para buscar contas bancárias
  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contas bancárias:', err);
      setError('Erro ao buscar contas bancárias');
      return [];
    }
  };

  // Função para buscar cartões de crédito
  const fetchCreditCards = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar cartões de crédito:', err);
      setError('Erro ao buscar cartões de crédito');
      return [];
    }
  };

  // Função para inserir transação
  const insertTransaction = async (transaction: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    method: string;
    status?: string;
    mission_id?: string;
    receipt?: string;
    tags?: string[];
    account_id?: string;
    account_type?: 'bank_account' | 'credit_card';
  }) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          status: transaction.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir transação:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir despesa
  const insertExpense = async (expense: {
    mission_id?: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    is_advanced?: boolean;
    receipt?: string;
    accommodation_details?: any;
  }) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          employee_id: user.id,
          employee_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir despesa:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar status de despesa
  const updateExpenseStatus = async (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar status da despesa:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir pagamento
  const insertPayment = async (payment: {
    provider_id?: string;
    provider_name: string;
    amount: number;
    due_date: string;
    payment_date?: string;
    status: string;
    type: string;
    description: string;
    installments?: number;
    current_installment?: number;
    tags?: string[];
    notes?: string;
    account_id?: string;
    account_type?: 'bank_account' | 'credit_card';
  }) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir pagamento:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar pagamento
  const updatePayment = async (paymentId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar pagamento:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  return {
    loading,
    error,
    fetchTransactions,
    fetchExpenses,
    fetchPayments,
    fetchMissions,
    fetchServiceProviders,
    fetchBankAccounts,
    fetchCreditCards,
    insertTransaction,
    insertExpense,
    updateExpenseStatus,
    insertPayment,
    updatePayment
  };
};
