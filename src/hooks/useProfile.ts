
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (profileData: {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      
      // Atualizar dados do perfil
      if (profileData.name || profileData.phone) {
        const updateData: any = {};
        if (profileData.name) updateData.name = profileData.name;
        if (profileData.phone) updateData.phone = profileData.phone;

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Atualizar email se fornecido e diferente do atual
      if (profileData.email && profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });

        if (emailError) throw emailError;

        toast({
          title: "Email atualizado",
          description: "Verifique seu email para confirmar a alteração.",
        });
      }

      // Atualizar senha se fornecida
      if (profileData.newPassword && profileData.currentPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: profileData.newPassword
        });

        if (passwordError) throw passwordError;

        toast({
          title: "Senha atualizada",
          description: "Sua senha foi alterada com sucesso.",
        });
      }

      // Atualizar dados na memória
      await refreshProfile();
      
      toast({
        title: "Dados atualizados",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      return { data: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
};
