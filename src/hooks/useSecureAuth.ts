
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/authUtils';
import { useToastFeedback } from './useToastFeedback';

export const useSecureAuth = () => {
  const { profile } = useAuth();
  const { showError } = useToastFeedback();
  const [loading, setLoading] = useState(false);

  const validatePermission = (requiredRole: 'admin' | 'user' = 'user'): boolean => {
    if (!profile) {
      showError('Acesso Negado', 'Usuário não autenticado');
      return false;
    }

    if (requiredRole === 'admin' && !isAdmin(profile)) {
      showError('Acesso Negado', 'Permissões insuficientes para esta operação');
      return false;
    }

    return true;
  };

  const secureProviderAccess = async (email: string, accessCode: string) => {
    setLoading(true);
    try {
      // Use edge function for secure password verification
      const { data, error } = await supabase.functions.invoke('verify-provider-access', {
        body: { email, access_code: accessCode }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Secure access verification failed');
      return { data: null, error: err instanceof Error ? err.message : 'Erro de autenticação' };
    } finally {
      setLoading(false);
    }
  };

  const secureEmployeeAccess = async (email: string, accessCode: string) => {
    setLoading(true);
    try {
      // Use edge function for secure access verification
      const { data, error } = await supabase.functions.invoke('verify-employee-access', {
        body: { email, access_code: accessCode }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Secure employee access verification failed');
      return { data: null, error: err instanceof Error ? err.message : 'Erro de autenticação' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validatePermission,
    secureProviderAccess,
    secureEmployeeAccess
  };
};
