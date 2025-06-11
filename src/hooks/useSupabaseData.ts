import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const useSupabaseData = () => {
  const { profile, user } = useAuth();
  const { showError, showSuccess } = useToastFeedback();
  const [loading, setLoading] = useState(false);

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
      
      // Create access record
      const { data: access, error: accessError } = await supabase
        .from('service_provider_access')
        .insert([{
          provider_id: provider.id,
          email: accessData.access_email,
          password_hash: accessData.password, // In real app, this should be hashed
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
      
      // Delete access records first
      await supabase
        .from('service_provider_access')
        .delete()
        .eq('provider_id', providerId);

      // Then delete provider
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

  return {
    loading,
    fetchServiceProviders,
    fetchProviderAccess,
    insertServiceProvider,
    insertServiceProviderWithAccess,
    deleteServiceProviderWithAccess
  };
};
