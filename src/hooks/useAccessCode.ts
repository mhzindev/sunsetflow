
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAccessCode = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const useCode = async (accessCode: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('use_access_code', {
        access_code: accessCode
      });

      if (error) {
        console.error('Erro ao usar código de acesso:', error);
        toast({
          title: "Erro",
          description: "Erro ao validar código de acesso",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      if (data && data.success) {
        toast({
          title: "Sucesso",
          description: "Código de acesso usado com sucesso! Você agora faz parte da empresa.",
        });
        
        // Recarregar a sessão para atualizar o perfil
        await supabase.auth.refreshSession();
        
        return { success: true, data };
      } else {
        toast({
          title: "Código inválido",
          description: data?.message || "Código de acesso inválido ou expirado",
          variant: "destructive"
        });
        return { success: false, error: data?.message || "Código inválido" };
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao validar código",
        variant: "destructive"
      });
      return { success: false, error: "Erro inesperado" };
    } finally {
      setLoading(false);
    }
  };

  return {
    useCode,
    loading
  };
};
