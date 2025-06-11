
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const useSupabaseDataIsolated = () => {
  const { profile, user } = useAuth();
  const { companyId, isValidated } = useCompanyIsolation();
  const { showError } = useToastFeedback();
  const [loading, setLoading] = useState(false);

  // Função para validar isolamento de dados
  const validateDataIsolation = (data: any[], expectedCompanyId: string | null, dataType: string) => {
    if (!expectedCompanyId) {
      console.warn(`Sem company_id para validar isolamento de ${dataType}`);
      return [];
    }

    const filteredData = data.filter(item => {
      // Para transações, verificar company_id direto
      if (item.company_id) {
        const isValid = item.company_id === expectedCompanyId;
        if (!isValid) {
          console.error(`VAZAMENTO DETECTADO em ${dataType}:`, {
            itemId: item.id,
            itemCompanyId: item.company_id,
            expectedCompanyId,
            userProfile: profile?.id
          });
        }
        return isValid;
      }

      // Para dados sem company_id direto (expenses, missions, revenues)
      // verificar via relacionamentos
      return true; // Will be filtered by RLS
    });

    console.log(`${dataType} - Total: ${data.length}, Válidos: ${filteredData.length}, Company: ${expectedCompanyId}`);
    return filteredData;
  };

  const fetchTransactions = async () => {
    if (!isValidated || !companyId) {
      console.log('Sem validação ou company_id para buscar transações');
      return [];
    }

    try {
      setLoading(true);
      console.log('Buscando transações com company_id:', companyId);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', companyId) // FILTRO EXPLÍCITO por segurança extra
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
      }

      // Validação dupla de isolamento
      const validatedData = validateDataIsolation(data || [], companyId, 'transactions');
      console.log(`Transações isoladas encontradas: ${validatedData.length}`);
      
      return validatedData;
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
      console.log('Buscando pagamentos com company_id:', companyId);

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('company_id', companyId) // FILTRO EXPLÍCITO por segurança extra
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw error;
      }

      // Validação dupla de isolamento
      const validatedData = validateDataIsolation(data || [], companyId, 'payments');
      console.log(`Pagamentos isolados encontrados: ${validatedData.length}`);
      
      return validatedData;
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
      console.log('Buscando despesas via missões com company_id:', companyId);

      // Buscar despesas através de missões da empresa
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          missions!inner(
            id,
            title,
            location,
            client_name,
            created_by,
            profiles!inner(company_id)
          )
        `)
        .eq('missions.profiles.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        throw error;
      }

      console.log(`Despesas encontradas (isoladas por missão): ${data?.length || 0}`);
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
      console.log('Buscando missões com company_id:', companyId);

      // Buscar missões criadas por usuários da empresa
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          profiles!inner(company_id)
        `)
        .eq('profiles.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar missões:', error);
        throw error;
      }

      console.log(`Missões encontradas (isoladas por empresa): ${data?.length || 0}`);
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
      console.log('Buscando receitas pendentes com company_id:', companyId);

      // Buscar receitas pendentes através de missões da empresa
      const { data, error } = await supabase
        .from('pending_revenues')
        .select(`
          *,
          missions!inner(
            id,
            title,
            location,
            client_name,
            created_by,
            profiles!inner(company_id)
          )
        `)
        .eq('missions.profiles.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas pendentes:', error);
        throw error;
      }

      console.log(`Receitas pendentes encontradas (isoladas): ${data?.length || 0}`);
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
      console.log('Buscando receitas confirmadas com company_id:', companyId);

      // Buscar receitas confirmadas através de missões da empresa
      const { data, error } = await supabase
        .from('confirmed_revenues')
        .select(`
          *,
          missions!inner(
            id,
            title,
            location,
            client_name,
            created_by,
            profiles!inner(company_id)
          )
        `)
        .eq('missions.profiles.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar receitas confirmadas:', error);
        throw error;
      }

      console.log(`Receitas confirmadas encontradas (isoladas): ${data?.length || 0}`);
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
