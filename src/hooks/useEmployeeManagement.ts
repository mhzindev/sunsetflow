
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/database';
import { EmployeeAccessCode } from '@/types/company';
import { useToast } from '@/hooks/use-toast';

export const useEmployeeManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [accessCodes, setAccessCodes] = useState<EmployeeAccessCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    if (!user || !profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('active', true);

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
    }
  };

  const fetchAccessCodes = async () => {
    if (!user || !profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('employee_access_codes')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear os dados do banco para a interface TypeScript
      const mappedCodes = (data || []).map(code => ({
        id: code.id,
        code: code.code,
        companyId: code.company_id,
        employeeName: code.employee_name,
        employeeEmail: code.employee_email,
        isUsed: code.is_used,
        createdAt: code.created_at,
        expires_at: code.expires_at,
        usedAt: code.used_at
      }));
      
      setAccessCodes(mappedCodes);
    } catch (err) {
      console.error('Erro ao buscar códigos de acesso:', err);
    }
  };

  const createAccessCode = async (employeeName: string, employeeEmail: string) => {
    if (!profile?.company_id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se já existe código ativo para este email
      const { data: existingCode, error: checkError } = await supabase
        .from('employee_access_codes')
        .select('*')
        .eq('employee_email', employeeEmail)
        .eq('company_id', profile.company_id)
        .eq('is_used', false);

      if (checkError) throw checkError;

      if (existingCode && existingCode.length > 0) {
        toast({
          title: "Aviso",
          description: `Já existe um código ativo para ${employeeEmail}`,
          variant: "destructive"
        });
        return;
      }

      // Gerar código único
      const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { data, error } = await supabase
        .from('employee_access_codes')
        .insert({
          code,
          employee_name: employeeName,
          employee_email: employeeEmail,
          company_id: profile.company_id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Código criado",
        description: `Código de acesso criado para ${employeeName}`,
      });

      await fetchAccessCodes();
    } catch (err) {
      console.error('Erro ao criar código de acesso:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar código de acesso",
        variant: "destructive"
      });
    }
  };

  const toggleAccessCode = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('employee_access_codes')
        .update({ is_used: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Código ${!currentStatus ? 'desativado' : 'ativado'} com sucesso`,
      });

      await fetchAccessCodes();
    } catch (err) {
      console.error('Erro ao alterar status do código:', err);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do código",
        variant: "destructive"
      });
    }
  };

  const deleteAccessCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('employee_access_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Código excluído",
        description: "Código de acesso excluído com sucesso",
      });

      await fetchAccessCodes();
    } catch (err) {
      console.error('Erro ao excluir código:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir código de acesso",
        variant: "destructive"
      });
    }
  };

  const deleteEmployeeWithAccess = async (employeeEmail: string, employeeName: string) => {
    try {
      // Primeiro excluir todos os códigos de acesso do funcionário
      const { error: accessError } = await supabase
        .from('employee_access_codes')
        .delete()
        .eq('employee_email', employeeEmail)
        .eq('company_id', profile?.company_id);

      if (accessError) throw accessError;

      // Depois excluir o perfil do funcionário (se existir na tabela profiles)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('email', employeeEmail)
        .eq('company_id', profile?.company_id);

      // Não lançar erro se o perfil não existir, pois pode ser apenas um código de acesso

      toast({
        title: "Funcionário removido",
        description: `${employeeName} foi removido do sistema junto com seus acessos`,
      });

      await Promise.all([fetchEmployees(), fetchAccessCodes()]);
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir funcionário e seus acessos",
        variant: "destructive"
      });
    }
  };

  const deactivateEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Funcionário desativado",
        description: "Funcionário foi desativado com sucesso",
      });

      await fetchEmployees();
    } catch (err) {
      console.error('Erro ao desativar funcionário:', err);
      toast({
        title: "Erro",
        description: "Erro ao desativar funcionário",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Código copiado para a área de transferência",
      });
    } catch (err) {
      console.error('Erro ao copiar:', err);
      toast({
        title: "Erro",
        description: "Erro ao copiar código",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      setLoading(true);
      Promise.all([fetchEmployees(), fetchAccessCodes()]).finally(() => {
        setLoading(false);
      });
    }
  }, [profile?.company_id]);

  return {
    employees,
    accessCodes,
    loading,
    createAccessCode,
    toggleAccessCode,
    deleteAccessCode,
    deleteEmployeeWithAccess,
    deactivateEmployee,
    copyToClipboard,
    refetch: () => Promise.all([fetchEmployees(), fetchAccessCodes()])
  };
};
