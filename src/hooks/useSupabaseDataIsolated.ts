
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const useSupabaseDataIsolated = () => {
  const { profile, user } = useAuth();
  const { companyId, isValidated } = useCompanyIsolation();
  const { showError } = useToastFeedback();
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar transações');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando transações com RLS ativo para empresa:', companyId);

      // Com RLS ativo, não precisamos filtrar por company_id na query
      // As políticas RLS garantem o isolamento automático
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
      }

      console.log(`Transações encontradas (com isolamento RLS):`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      showError('Erro', 'Erro ao carregar transações');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar pagamentos');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando pagamentos com RLS ativo para empresa:', companyId);

      // RLS garante isolamento automático
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw error;
      }

      console.log(`Pagamentos encontrados (com isolamento RLS):`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      showError('Erro', 'Erro ao carregar pagamentos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar despesas');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando despesas com RLS ativo para empresa:', companyId);

      // RLS garante isolamento via employee_id e mission_id
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          missions(
            title,
            location,
            client_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        throw error;
      }

      console.log(`Despesas encontradas (com isolamento RLS):`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      showError('Erro', 'Erro ao carregar despesas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMissions = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar missões');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando missões com RLS ativo para empresa:', companyId);

      // RLS garante isolamento via created_by
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar missões:', error);
        throw error;
      }

      console.log(`Missões encontradas (com isolamento RLS):`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      showError('Erro', 'Erro ao carregar missões');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRevenues = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar receitas pendentes');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando receitas pendentes com RLS ativo para empresa:', companyId);

      // RLS garante isolamento via mission_id
      const { data, error } = await supabase
        .from('pending_revenues')
        .select(`
          *,
          missions(
            title,
            location,
            client_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas pendentes:', error);
        throw error;
      }

      console.log(`Receitas pendentes encontradas (com isolamento RLS):`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar receitas pendentes:', error);
      showError('Erro', 'Erro ao carregar receitas pendentes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedRevenues = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar receitas confirmadas');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando receitas confirmadas com RLS ativo para empresa:', companyId);

      // RLS garante isolamento via mission_id
      const { data, error } = await supabase
        .from('confirmed_revenues')
        .select(`
          *,
          missions(
            title,
            location,
            client_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas confirmadas:', error);
        throw error;
      }

      console.log(`Receitas confirmadas encontradas (com isolamento RLS):`, data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar receitas confirmadas:', error);
      showError('Erro', 'Erro ao carregar receitas confirmadas');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchTransactions,
    fetchPayments,
    fetchExpenses,
    fetchMissions,
    fetchPendingRevenues,
    fetchConfirmedRevenues,
    loading
  };
};
