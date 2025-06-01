
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Carregando perfil do usuário:', authUser.id);
      console.log('Metadados do usuário:', authUser.user_metadata);
      
      // Aguardar um pouco para garantir que o trigger foi executado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar perfil do usuário com retry
      let profile = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!profile && attempts < maxAttempts) {
        attempts++;
        console.log(`Tentativa ${attempts} de buscar perfil...`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          console.error(`Erro na tentativa ${attempts}:`, error);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } else {
          profile = data;
        }
      }

      if (!profile) {
        console.log('Perfil não encontrado, criando um novo...');
        // Se não encontrou o perfil após várias tentativas, criar um baseado nos metadados
        const roleFromMeta = authUser.user_metadata?.role || 'employee';
        const nameFromMeta = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário';
        
        console.log('Dados para criar perfil:', {
          id: authUser.id,
          email: authUser.email,
          name: nameFromMeta,
          role: roleFromMeta
        });
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            name: nameFromMeta,
            role: roleFromMeta
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          // Tentar buscar novamente caso já tenha sido criado pelo trigger
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (existingProfile) {
            profile = existingProfile;
          } else {
            return;
          }
        } else {
          profile = newProfile;
        }
      }

      if (profile) {
        console.log('Perfil carregado com sucesso:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'owner' | 'employee',
          active: true,
          createdAt: profile.created_at
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    // Buscar usuário atual
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setSupabaseUser(authUser);
        await loadUserProfile(authUser);
      }
      
      setIsLoading(false);
    };

    getUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSupabaseUser(null);
  };

  const value = {
    user,
    supabaseUser,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
