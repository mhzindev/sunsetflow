
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Se o perfil não foi encontrado e não excedeu o limite de tentativas,
        // aguardar um pouco e tentar novamente (para aguardar trigger de criação automática)
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`Perfil não encontrado, tentativa ${retryCount + 1}/3. Aguardando...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const clearUserState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('Usuário deslogado, limpando estado e redirecionando...');
          clearUserState();
          setLoading(false);
          // Redirecionar para página de auth após logout
          if (event === 'SIGNED_OUT') {
            window.location.href = '/auth';
          }
          return;
        }

        setSession(session);
        setUser(session.user);
        
        if (session?.user) {
          // Aguardar criação do perfil com retry para novos signups
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      
      if (!session) {
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session.user);
      
      if (session.user) {
        fetchProfile(session.user.id).then((userProfile) => {
          setProfile(userProfile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Iniciando logout...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
      // O estado será limpo pelo listener onAuthStateChange
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      // Em caso de erro, limpar estado manualmente e redirecionar
      clearUserState();
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!session
  };

  console.log('AuthProvider rendering with:', { user: !!user, profile: !!profile, loading, isAuthenticated: !!user && !!session });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
