
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types/company';
import { useToast } from '@/hooks/use-toast';

export const useCompany = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      
      // Se o usuário tem company_id no perfil, buscar a empresa
      if (profile.company_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (error) throw error;
        setCompany(data);
      } else if (profile.role === 'admin') {
        // Se é admin sem empresa, buscar empresa que ele possui
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setCompany(data);
      }
    } catch (err) {
      console.error('Erro ao buscar empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'createdAt' | 'ownerId'>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar o perfil do usuário para associar à empresa
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: data.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setCompany(data);
      
      toast({
        title: "Empresa criada",
        description: "Empresa criada com sucesso!",
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar empresa';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    }
  };

  const updateCompany = async (companyData: Partial<Company>) => {
    if (!company) throw new Error('Nenhuma empresa carregada');

    try {
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;

      setCompany(data);
      
      toast({
        title: "Empresa atualizada",
        description: "Dados da empresa atualizados com sucesso!",
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar empresa';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [user, profile]);

  return {
    company,
    loading,
    error,
    createCompany,
    updateCompany,
    refetch: fetchCompany
  };
};
