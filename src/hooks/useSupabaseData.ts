
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const useSupabaseData = () => {
  const { profile, user } = useAuth();
  const { showError, showSuccess } = useToastFeedback();
  const [loading, setLoading] = useState(false);

  // Service Providers methods
  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching service providers:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderAccess = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_provider_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching provider access:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertServiceProvider = async (providerData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_providers')
        .insert([providerData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting service provider:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const insertServiceProviderWithAccess = async (provider: any, accessData: any) => {
    try {
      setLoading(true);
      
      const { data: access, error: accessError } = await supabase
        .from('service_provider_access')
        .insert([{
          provider_id: provider.id,
          email: accessData.access_email,
          password_hash: accessData.password,
          permissions: accessData.permissions,
          access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        }])
        .select()
        .single();

      if (accessError) throw accessError;
      
      return { data: { provider, access }, error: null };
    } catch (error) {
      console.error('Error creating provider access:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const deleteServiceProviderWithAccess = async (providerId: string) => {
    try {
      setLoading(true);
      
      await supabase
        .from('service_provider_access')
        .delete()
        .eq('provider_id', providerId);

      const { data, error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', providerId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting service provider:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Transactions methods
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertTransaction = async (transactionData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user?.id,
          user_name: profile?.name || 'Usuario',
          company_id: profile?.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting transaction:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Payments methods
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertPayment = async (paymentData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          company_id: profile?.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting payment:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (paymentId: string, updates: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Expenses methods
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertExpense = async (expenseData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          employee_id: user?.id,
          employee_name: profile?.name || 'Usuario',
          company_id: profile?.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting expense:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Missions methods
  const fetchMissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching missions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertMission = async (missionData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .insert([{
          ...missionData,
          created_by: user?.id,
          company_id: profile?.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting mission:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const updateMission = async (missionId: string, missionData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .update(missionData)
        .eq('id', missionId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating mission:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Clients methods
  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const insertClient = async (clientData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          company_id: profile?.company_id
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error inserting client:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Bank Accounts methods
  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Credit Cards methods
  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching credit cards:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // Service Providers
    fetchServiceProviders,
    fetchProviderAccess,
    insertServiceProvider,
    insertServiceProviderWithAccess,
    deleteServiceProviderWithAccess,
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
    updateMission,
    // Clients
    fetchClients,
    insertClient,
    // Accounts
    fetchBankAccounts,
    fetchCreditCards
  };
};
