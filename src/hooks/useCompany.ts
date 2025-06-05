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
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching company for user:', user.id, 'with profile:', profile);
      
      // Se o usuário é um prestador, buscar empresa através do prestador
      if (profile.user_type === 'provider' && profile.provider_id) {
        console.log('Fetching company for provider:', profile.provider_id);
        
        // Buscar o prestador e suas informações COM company_id
        const { data: providerData, error: providerError } = await supabase
          .from('service_providers')
          .select('*, companies(*)')
          .eq('id', profile.provider_id)
          .single();

        if (providerError) {
          console.error('Error fetching provider:', providerError);
          setCompany(null);
        } else if (providerData && providerData.companies) {
          console.log('Provider data found with company:', providerData);
          // Usar os dados da empresa real, não criar uma virtual
          setCompany({
            id: providerData.companies.id,
            name: providerData.companies.name,
            legalName: providerData.companies.legal_name,
            cnpj: providerData.companies.cnpj,
            email: providerData.companies.email,
            phone: providerData.companies.phone,
            address: providerData.companies.address,
            createdAt: providerData.companies.created_at,
            ownerId: providerData.companies.owner_id
          });
        } else {
          console.log('Provider found but no company associated');
          setCompany(null);
        }
      } else if (profile.company_id) {
        // Se o usuário tem company_id no perfil, buscar a empresa
        console.log('Fetching company by company_id:', profile.company_id);
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();

        if (error) {
          console.error('Error fetching company by company_id:', error);
          throw error;
        }
        
        if (data) {
          console.log('Company data found:', data);
          setCompany({
            id: data.id,
            name: data.name,
            legalName: data.legal_name,
            cnpj: data.cnpj,
            email: data.email,
            phone: data.phone,
            address: data.address,
            createdAt: data.created_at,
            ownerId: data.owner_id
          });
        }
      } else if (profile.role === 'admin') {
        // Se é admin sem empresa, buscar empresa que ele possui
        console.log('Fetching company by owner_id:', user.id);
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching company by owner_id:', error);
          throw error;
        }
        
        if (data) {
          console.log('Company data found by owner:', data);
          setCompany({
            id: data.id,
            name: data.name,
            legalName: data.legal_name,
            cnpj: data.cnpj,
            email: data.email,
            phone: data.phone,
            address: data.address,
            createdAt: data.created_at,
            ownerId: data.owner_id
          });
        } else {
          console.log('No company found for admin user');
          setCompany(null);
        }
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
      console.log('Creating company with data:', companyData);
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          legal_name: companyData.legalName,
          cnpj: companyData.cnpj,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }

      console.log('Company created successfully:', data);

      // Atualizar o perfil do usuário para associar à empresa
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: data.id })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      const mappedCompany = {
        id: data.id,
        name: data.name,
        legalName: data.legal_name,
        cnpj: data.cnpj,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdAt: data.created_at,
        ownerId: data.owner_id
      };

      setCompany(mappedCompany);
      
      toast({
        title: "Empresa criada",
        description: "Empresa criada com sucesso!",
      });

      return { data: mappedCompany, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar empresa';
      console.error('Create company error:', err);
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
      console.log('Updating company with data:', companyData);
      const updateData: any = {};
      if (companyData.name !== undefined) updateData.name = companyData.name;
      if (companyData.legalName !== undefined) updateData.legal_name = companyData.legalName;
      if (companyData.cnpj !== undefined) updateData.cnpj = companyData.cnpj;
      if (companyData.email !== undefined) updateData.email = companyData.email;
      if (companyData.phone !== undefined) updateData.phone = companyData.phone;
      if (companyData.address !== undefined) updateData.address = companyData.address;

      const { data, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', company.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }

      console.log('Company updated successfully:', data);

      const mappedCompany = {
        id: data.id,
        name: data.name,
        legalName: data.legal_name,
        cnpj: data.cnpj,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdAt: data.created_at,
        ownerId: data.owner_id
      };

      setCompany(mappedCompany);
      
      toast({
        title: "Empresa atualizada",
        description: "Dados da empresa atualizados com sucesso!",
      });

      return { data: mappedCompany, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar empresa';
      console.error('Update company error:', err);
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
