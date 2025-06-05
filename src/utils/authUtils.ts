
import { Profile } from '@/types/database';

export const isAdmin = (profile: Profile | null): boolean => {
  return profile?.role === 'admin';
};

export const isProvider = (profile: Profile | null): boolean => {
  return profile?.user_type === 'provider';
};

export const canManageProviders = (profile: Profile | null): boolean => {
  return isAdmin(profile);
};

export const canCreatePayments = (profile: Profile | null): boolean => {
  return isAdmin(profile);
};

export const canApproveEvents = (profile: Profile | null): boolean => {
  return isAdmin(profile);
};
