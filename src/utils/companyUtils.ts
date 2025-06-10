
import { Profile } from '@/types/database';

export const isCompanyOwner = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  // Verificar se é admin (dono da empresa)
  return profile.role === 'admin';
};

export const hasCompanyAccess = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  // Verificar se tem company_id válido
  return !!profile.company_id;
};

export const canManageCompany = (profile: Profile | null): boolean => {
  return isCompanyOwner(profile) && hasCompanyAccess(profile);
};

export const getUserAccessLevel = (profile: Profile | null): 'owner' | 'employee' | 'provider' | 'none' => {
  if (!profile) return 'none';
  
  if (profile.role === 'admin' && profile.company_id) return 'owner';
  if (profile.user_type === 'provider' && profile.provider_id) return 'provider';
  if (profile.company_id) return 'employee';
  
  return 'none';
};
