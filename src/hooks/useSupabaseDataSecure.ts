
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const useSupabaseDataSecure = () => {
  const { profile, user } = useAuth();
  const { showError, showSuccess } = useToastFeedback();
  const [loading, setLoading] = useState(false);

  // Verificar se usuário tem acesso válido
  const hasValidAccess = () => {
    if (!user || !profile) return false;
    if (!profile.company_id) {
      console.warn('🔒 useSupabaseDataSecure: Usuário sem empresa associada');
      return false;
    }
    return true;
  };

  // Service Providers methods
  const fetchServiceProviders = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      console.log('🏢 Buscando prestadores para empresa:', profile.company_id);
      
      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Prestadores encontrados:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching service providers:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertServiceProvider = async (providerData: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // Garantir que company_id está incluído
      const dataWithCompany = {
        ...providerData,
        company_id: profile.company_id
      };
      
      const { data, error } = await supabase
        .from('service_providers')
        .insert([dataWithCompany])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inserting service provider:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Transactions methods
  const fetchTransactions = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      console.log('🏢 Buscando transações para empresa:', profile.company_id);
      
      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Transações encontradas:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertTransaction = async (transactionData: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // Usar função RPC que já inclui company_id automaticamente
      const { data, error } = await supabase.rpc('insert_transaction_with_casting', {
        p_type: transactionData.type,
        p_category: transactionData.category,
        p_amount: transactionData.amount,
        p_description: transactionData.description,
        p_date: transactionData.date,
        p_method: transactionData.method,
        p_status: transactionData.status,
        p_user_id: user?.id,
        p_user_name: profile?.name || 'Usuario',
        p_mission_id: transactionData.mission_id || null,
        p_receipt: transactionData.receipt || null,
        p_tags: transactionData.tags || null,
        p_account_id: transactionData.account_id || null,
        p_account_type: transactionData.account_type || null
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inserting transaction:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Payments methods
  const fetchPayments = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      console.log('🏢 Buscando pagamentos para empresa:', profile.company_id);
      
      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Pagamentos encontrados:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertPayment = async (paymentData: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // Garantir que company_id está incluído
      const dataWithCompany = {
        ...paymentData,
        company_id: profile.company_id
      };
      
      const { data, error } = await supabase
        .from('payments')
        .insert([dataWithCompany])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inserting payment:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (paymentId: string, updates: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // RLS já garante que só pode atualizar pagamentos da própria empresa
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Expenses methods
  const fetchExpenses = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      console.log('🏢 Buscando despesas para empresa:', profile.company_id);
      
      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Despesas encontradas:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertExpense = async (expenseData: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // Garantir que company_id está incluído
      const dataWithCompany = {
        ...expenseData,
        employee_id: user?.id,
        employee_name: profile?.name || 'Usuario',
        company_id: profile.company_id
      };
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([dataWithCompany])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inserting expense:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Missions methods
  const fetchMissions = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      console.log('🏢 Buscando missões para empresa:', profile.company_id);
      
      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Missões encontradas:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching missions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertMission = async (missionData: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // Garantir que company_id está incluído
      const dataWithCompany = {
        ...missionData,
        created_by: user?.id,
        company_id: profile.company_id
      };
      
      const { data, error } = await supabase
        .from('missions')
        .insert([dataWithCompany])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inserting mission:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Clients methods
  const fetchClients = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      console.log('🏢 Buscando clientes para empresa:', profile.company_id);
      
      // RLS já filtra por company_id automaticamente
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ Clientes encontrados:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertClient = async (clientData: any) => {
    try {
      if (!hasValidAccess()) {
        return { data: null, error: 'Usuário sem acesso válido' };
      }
      
      setLoading(true);
      
      // Garantir que company_id está incluído
      const dataWithCompany = {
        ...clientData,
        company_id: profile.company_id
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert([dataWithCompany])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error inserting client:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Bank Accounts methods (filtrados por user_id para contas pessoais)
  const fetchBankAccounts = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching bank accounts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Credit Cards methods (filtrados por user_id para cartões pessoais)
  const fetchCreditCards = async () => {
    try {
      if (!hasValidAccess()) return [];
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error fetching credit cards:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    hasValidAccess,
    // Service Providers
    fetchServiceProviders,
    insertServiceProvider,
    // Transactions
    fetchTransactions,
    insertTransaction,
    // Payments
    fetchPayments,
    insertPayment,
    updatePayment,
    // Expenses
    fetchExpenses,
    insertExpense,
    // Missions
    fetchMissions,
    insertMission,
    // Clients
    fetchClients,
    insertClient,
    // Accounts
    fetchBankAccounts,
    fetchCreditCards
  };
};
