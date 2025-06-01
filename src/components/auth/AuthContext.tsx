
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
      console.log('🔄 Carregando perfil do usuário:', authUser.id);
      console.log('📋 Metadados do usuário:', authUser.user_metadata);
      
      // Aguardar um pouco para garantir que o trigger foi executado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar perfil do usuário com retry mais eficiente
      let profile = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!profile && attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 Tentativa ${attempts}/${maxAttempts} de buscar perfil...`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          console.error(`❌ Erro na tentativa ${attempts}:`, error);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
        } else {
          profile = data;
          if (profile) {
            console.log(`✅ Perfil encontrado na tentativa ${attempts}:`, profile);
          } else {
            console.log(`⚠️ Perfil não encontrado na tentativa ${attempts}`);
          }
        }
      }

      // Se ainda não encontrou o perfil, tentar criar um
      if (!profile) {
        console.log('🆕 Perfil não encontrado, tentando criar...');
        
        const roleFromMeta = authUser.user_metadata?.role || 'employee';
        const nameFromMeta = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário';
        
        console.log('📝 Dados para criar perfil:', {
          id: authUser.id,
          email: authUser.email,
          name: nameFromMeta,
          role: roleFromMeta
        });
        
        // Tentar inserir o perfil diretamente
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            name: nameFromMeta,
            role: roleFromMeta as 'owner' | 'employee'
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao criar perfil:', insertError);
          
          // Se falhou por chave duplicada, tentar buscar novamente
          if (insertError.code === '23505') {
            console.log('🔄 Perfil já existe, buscando novamente...');
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();
            
            if (existingProfile) {
              profile = existingProfile;
              console.log('✅ Perfil encontrado após erro de duplicata:', profile);
            }
          }
        } else {
          console.log('✅ Perfil criado com sucesso:', newProfile);
          profile = newProfile;
        }
      }

      // Se conseguiu o perfil, configurar o usuário
      if (profile) {
        console.log('🎉 Configurando usuário no estado:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'owner' | 'employee',
          active: true,
          createdAt: profile.created_at
        });
      } else {
        console.error('💥 Falha total ao encontrar/criar perfil');
        // Em caso de falha total, criar um usuário básico temporário
        console.log('🚨 Criando usuário temporário para permitir acesso...');
        setUser({
          id: authUser.id,
          name: authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          role: 'employee',
          active: true,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar perfil:', error);
      
      // Fallback final: criar usuário básico
      console.log('🚨 Criando usuário de emergência...');
      setUser({
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || '',
        role: 'employee',
        active: true,
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    // Buscar usuário atual
    const getUser = async () => {
      console.log('🔄 Verificando usuário atual...');
      
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          console.log('👤 Usuário autenticado encontrado:', authUser.id);
          setSupabaseUser(authUser);
          await loadUserProfile(authUser);
        } else {
          console.log('👤 Nenhum usuário autenticado');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
      }
      
      setIsLoading(false);
    };

    getUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state mudou:', event, session?.user?.id);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user);
        } else {
          console.log('🚪 Usuário deslogado');
          setUser(null);
          setSupabaseUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 Tentando fazer login:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
    console.log('✅ Login realizado com sucesso');
  };

  const logout = async () => {
    console.log('🚪 Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
    
    setUser(null);
    setSupabaseUser(null);
    console.log('✅ Logout realizado com sucesso');
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
