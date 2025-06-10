
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

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        
        // Se perfil não encontrado, criar um básico
        if (error.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando perfil básico...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              name: user?.user_metadata?.name || 'Usuário',
              role: 'user',
              active: true
            })
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            return null;
          }

          console.log('Perfil criado:', newProfile);
          return newProfile;
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
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Usuário logado ou token atualizado');
        setSession(newSession);
        setUser(newSession.user);
        
        if (newSession.user) {
          console.log('Buscando perfil do usuário...');
          
          // Timeout de segurança para busca de perfil
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 10000)
          );
          
          try {
            const userProfile = await Promise.race([
              fetchProfile(newSession.user.id),
              timeoutPromise
            ]);
            
            setProfile(userProfile as Profile | null);
            
            if (!userProfile) {
              console.warn('Perfil não encontrado, mas permitindo acesso ao sistema');
            }
          } catch (timeoutError) {
            console.warn('Timeout na busca do perfil, permitindo acesso sem perfil:', timeoutError);
            setProfile(null);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar mudança de estado de auth:', error);
    } finally {
      // SEMPRE definir loading como false
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Configurando AuthProvider...');
    
    let mounted = true;
    
    // Configurar listener de mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        await handleAuthStateChange(event, session);
      }
    });

    // Verificar sessão existente com timeout
    const initializeAuth = async () => {
      try {
        console.log('Verificando sessão existente...');
        
        // Timeout de segurança para getSession
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao verificar sessão')), 8000)
        );
        
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);
        
        const { data: { session }, error } = sessionResult as any;
        
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
        if (mounted) {
          await handleAuthStateChange('SIGNED_IN', session);
        }
        
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Fallback de segurança - sempre parar loading após 15 segundos
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Timeout de segurança ativado - parando loading');
        setLoading(false);
      }
    }, 15000);

    return () => {
      mounted = false;
      console.log('Desvinculando listener de autenticação');
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
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
      } else {
        console.log('Logout realizado com sucesso');
      }
      
      // Sempre limpar estado local
      clearUserState();
      
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
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
