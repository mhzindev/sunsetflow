
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';
import { hasCompanyAccess, isCompanyOwner, getUserAccessLevel } from '@/utils/companyUtils';
import { getAuthCache, isValidProfile } from '@/utils/authCache';

export const useCompanyIsolationOptimized = () => {
  const { profile, loading: authLoading } = useAuth();
  const { showError } = useToastFeedback();
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateCompanyAccess();
  }, [profile, authLoading]);

  const validateCompanyAccess = async () => {
    console.log('useCompanyIsolationOptimized: Validando acesso da empresa...', {
      profile: !!profile,
      authLoading,
      profileId: profile?.id,
      companyId: profile?.company_id,
      role: profile?.role,
      userType: profile?.user_type
    });

    // Se ainda está carregando auth, aguardar
    if (authLoading) {
      console.log('useCompanyIsolationOptimized: Auth ainda carregando, aguardando...');
      setLoading(true);
      return;
    }

    // Se não há profile, verificar cache
    if (!profile?.id) {
      console.log('useCompanyIsolationOptimized: Sem profile, verificando cache...');
      const cache = getAuthCache();
      if (cache?.profile && isValidProfile(cache.profile)) {
        console.log('useCompanyIsolationOptimized: Cache válido encontrado, usando temporariamente');
        // Usar dados do cache temporariamente
        const cachedProfile = cache.profile;
        if (hasCompanyAccess(cachedProfile)) {
          setIsValidated(true);
          setLoading(false);
          return;
        }
      }
      
      console.log('useCompanyIsolationOptimized: Sem profile válido');
      setIsValidated(false);
      setLoading(false);
      return;
    }

    try {
      // Verificar se o usuário tem acesso válido à empresa
      const hasAccess = hasCompanyAccess(profile);
      const accessLevel = getUserAccessLevel(profile);
      
      console.log('useCompanyIsolationOptimized: Resultado da validação:', {
        hasAccess,
        accessLevel,
        companyId: profile.company_id,
        providerId: profile.provider_id,
        role: profile.role,
        userType: profile.user_type
      });

      if (!hasAccess) {
        if (accessLevel === 'none') {
          console.log('useCompanyIsolationOptimized: Usuário sem associação à empresa');
          showError('Acesso Restrito', 'Usuário não está associado a nenhuma empresa. Entre em contato com o administrador.');
        } else if (accessLevel === 'provider' && !profile.provider_id) {
          console.log('useCompanyIsolationOptimized: Prestador sem ID válido');
          showError('Acesso Restrito', 'Prestador sem ID válido. Entre em contato com o administrador.');
        }
        
        setIsValidated(false);
      } else {
        console.log('useCompanyIsolationOptimized: Acesso validado com sucesso');
        setIsValidated(true);
      }
    } catch (error) {
      console.error('useCompanyIsolationOptimized: Erro na validação:', error);
      setIsValidated(false);
    } finally {
      setLoading(false);
    }
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
    loading,
    companyId: profile?.company_id || null,
    ensureCompanyData,
    getUserCompanyId,
    validateCompanyOwnership,
    hasCompanyAccess: hasCompanyAccess(profile),
    isCompanyOwner: isCompanyOwner(profile),
    accessLevel: getUserAccessLevel(profile)
  };
};
