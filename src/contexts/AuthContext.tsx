
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
      console.log('Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Se o perfil não foi encontrado e não excedeu o limite de tentativas
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`Perfil não encontrado, tentativa ${retryCount + 1}/3. Aguardando criação...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchProfile(userId, retryCount + 1);
        }
        
        return null;
      }

      console.log('Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
      return null;
    }
  };

  const clearUserState = () => {
    console.log('Limpando estado do usuário...');
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const handleAuthStateChange = async (event: string, newSession: Session | null) => {
    console.log('Estado de autenticação alterado:', event, newSession?.user?.id);
    
    try {
      if (event === 'SIGNED_OUT' || !newSession) {
        console.log('Usuário deslogado ou sessão inválida');
        clearUserState();
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Usuário logado ou token atualizado');
        setSession(newSession);
        setUser(newSession.user);
        
        if (newSession.user) {
          console.log('Buscando perfil do usuário...');
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
          
          if (!userProfile) {
            console.warn('Perfil não encontrado após tentativas. Usuário pode precisar completar cadastro.');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar mudança de estado de auth:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Configurando AuthProvider...');
    
    // Configurar listener de mudanças de estado ANTES de verificar sessão existente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        console.log('Verificando sessão existente...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }

        if (!session) {
          console.log('Nenhuma sessão existente encontrada');
          setLoading(false);
          return;
        }

        console.log('Sessão existente encontrada:', session.user.id);
        await handleAuthStateChange('SIGNED_IN', session);
        
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('Desvinculando listener de autenticação');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Tentando criar conta para:', email);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Erro no signup:', error);
      } else {
        console.log('Signup realizado com sucesso');
      }

      return { error };
    } catch (error) {
      console.error('Erro inesperado no signup:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login para:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
      } else {
        console.log('Login realizado com sucesso');
      }

      return { error };
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, limpar estado local
        clearUserState();
      } else {
        console.log('Logout realizado com sucesso');
      }
      
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      // Em caso de erro, limpar estado manualmente
      clearUserState();
    } finally {
      setLoading(false);
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

  console.log('AuthProvider state:', { 
    user: !!user, 
    profile: !!profile, 
    loading, 
    isAuthenticated: !!user && !!session 
  });

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
