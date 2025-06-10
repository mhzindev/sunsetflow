
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';

export const useCompanyIsolation = () => {
  const { profile } = useAuth();
  const { showError } = useToastFeedback();
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    validateCompanyAccess();
  }, [profile]);

  const validateCompanyAccess = async () => {
    if (!profile?.id) {
      setIsValidated(false);
      return;
    }

    // Verificar se o usuário tem company_id válido
    if (!profile.company_id) {
      showError('Acesso Restrito', 'Usuário não está associado a nenhuma empresa. Entre em contato com o administrador.');
      setIsValidated(false);
      return;
    }

    setIsValidated(true);
  };

  const ensureCompanyData = (data: any) => {
    if (!profile?.company_id) {
      throw new Error('Company ID is required but not available');
    }
    
    return {
      ...data,
      company_id: profile.company_id
    };
  };

  const getUserCompanyId = () => {
    return profile?.company_id || null;
  };

  const validateCompanyOwnership = (dataCompanyId: string | null) => {
    return dataCompanyId === profile?.company_id;
  };

  return {
    isValidated,
    companyId: profile?.company_id || null,
    ensureCompanyData,
    getUserCompanyId,
    validateCompanyOwnership,
    hasCompanyAccess: !!profile?.company_id
  };
};
