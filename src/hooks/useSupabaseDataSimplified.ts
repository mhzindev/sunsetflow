
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastFeedback } from './useToastFeedback';

export const useSupabaseDataSimplified = () => {
  const { user, profile } = useAuth();
  const { showError, showSuccess } = useToastFeedback();
  const [loading, setLoading] = useState(false);

  // Função para buscar transações - SIMPLIFICADA (confia no RLS)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Buscando transações com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
      }

      console.log(`Transações encontradas (isoladas via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      showError('Erro', 'Erro ao carregar transações');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar pagamentos - SIMPLIFICADA (confia no RLS)
  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Buscando pagamentos com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw error;
      }

      console.log(`Pagamentos encontrados (isolados via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      showError('Erro', 'Erro ao carregar pagamentos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar despesas - SIMPLIFICADA (confia no RLS)
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log('Buscando despesas com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          missions!inner(
            title, 
            location, 
            client_name,
            start_date,
            end_date,
            budget,
            total_expenses,
            provider_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        return [];
      }

      console.log(`Despesas encontradas (isoladas via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      showError('Erro', 'Erro ao carregar despesas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar missões - SIMPLIFICADA (confia no RLS)
  const fetchMissions = async () => {
    try {
      setLoading(true);
      console.log('Buscando missões com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar missões:', error);
        return [];
      }

      console.log(`Missões encontradas (isoladas via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      showError('Erro', 'Erro ao carregar missões');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar prestadores - SIMPLIFICADA (confia no RLS)
  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      console.log('Buscando prestadores com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar prestadores:', error);
        throw error;
      }

      console.log(`Prestadores encontrados (isolados via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar receitas pendentes - SIMPLIFICADA (confia no RLS)
  const fetchPendingRevenues = async () => {
    try {
      setLoading(true);
      console.log('Buscando receitas pendentes com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('pending_revenues')
        .select(`
          *,
          missions!inner(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas pendentes:', error);
        return [];
      }

      console.log(`Receitas pendentes encontradas (isoladas via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar receitas pendentes:', error);
      showError('Erro', 'Erro ao carregar receitas pendentes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar receitas confirmadas - SIMPLIFICADA (confia no RLS)
  const fetchConfirmedRevenues = async () => {
    try {
      setLoading(true);
      console.log('Buscando receitas confirmadas com isolamento RLS automático...');

      const { data, error } = await supabase
        .from('confirmed_revenues')
        .select(`
          *,
          missions!inner(title, location)
        `)
        .order('received_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas confirmadas:', error);
        return [];
      }

      console.log(`Receitas confirmadas encontradas (isoladas via RLS): ${data?.length || 0}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar receitas confirmadas:', error);
      showError('Erro', 'Erro ao carregar receitas confirmadas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Função para criar transação - SIMPLIFICADA (confia no RLS)
  const createTransaction = async (transactionData: any) => {
    try {
      setLoading(true);
      console.log('Criando transação com isolamento RLS automático...');

      const { data, error } = await supabase.rpc('insert_transaction_with_casting', {
        p_type: transactionData.type,
        p_category: transactionData.category,
        p_amount: transactionData.amount,
        p_description: transactionData.description,
        p_date: transactionData.date,
        p_method: transactionData.method,
        p_status: transactionData.status || 'completed',
        p_user_id: user?.id || '',
        p_user_name: profile?.name || user?.email?.split('@')[0] || 'Usuário',
        p_mission_id: transactionData.mission_id || null,
        p_receipt: transactionData.receipt || null,
        p_tags: transactionData.tags || null,
        p_account_id: transactionData.account_id || null,
        p_account_type: transactionData.account_type || null
      });

      if (error) {
        console.error('Erro ao criar transação:', error);
        throw error;
      }

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

  // Função para criar pagamento - SIMPLIFICADA (confia no RLS)
  const createPayment = async (paymentData: any) => {
    try {
      setLoading(true);
      console.log('Criando pagamento com isolamento RLS automático...');

      // O company_id será automaticamente adicionado pela política RLS
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pagamento:', error);
        throw error;
      }

      showSuccess('Sucesso', 'Pagamento criado com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      showError('Erro', 'Erro ao criar pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchTransactions,
    fetchPayments,
    fetchExpenses,
    fetchMissions,
    fetchServiceProviders,
    fetchPendingRevenues,
    fetchConfirmedRevenues,
    createTransaction,
    createPayment,
    loading
  };
};
