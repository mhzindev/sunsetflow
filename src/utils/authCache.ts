
// Cache utilitário para dados de autenticação
interface AuthCacheData {
  profile: any;
  company: any;
  timestamp: number;
}

const CACHE_KEY = 'sunset_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const saveAuthCache = (profile: any, company: any = null) => {
  try {
    const cacheData: AuthCacheData = {
      profile,
      company,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('Cache de autenticação salvo:', { profile: !!profile, company: !!company });
  } catch (error) {
    console.warn('Erro ao salvar cache de autenticação:', error);
  }
};

export const getAuthCache = (): { profile: any; company: any } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: AuthCacheData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;
    
    if (age > CACHE_DURATION) {
      console.log('Cache de autenticação expirado, removendo...');
      clearAuthCache();
      return null;
    }

    console.log('Cache de autenticação recuperado:', { 
      profile: !!cacheData.profile, 
      company: !!cacheData.company,
      age: Math.round(age / 1000) + 's'
    });
    
    return {
      profile: cacheData.profile,
      company: cacheData.company
    };
  } catch (error) {
    console.warn('Erro ao recuperar cache de autenticação:', error);
    clearAuthCache();
    return null;
  }
};

export const clearAuthCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cache de autenticação limpo');
  } catch (error) {
    console.warn('Erro ao limpar cache:', error);
  }
};

export const isValidProfile = (profile: any): boolean => {
  return profile && 
         profile.id && 
         profile.email && 
         (profile.role === 'admin' || profile.role === 'user') &&
         (profile.user_type === 'admin' || profile.user_type === 'user' || profile.user_type === 'provider');
};
