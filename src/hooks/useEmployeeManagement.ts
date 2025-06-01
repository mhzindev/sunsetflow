
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
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const fetchAccessCodes = async () => {
    if (!profile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('employee_access_codes')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccessCodes(data || []);
    } catch (err) {
      console.error('Erro ao buscar códigos de acesso:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const generateAccessCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `STRACK-${new Date().getFullYear()}-${timestamp}`;
  };

  const createAccessCode = async (employeeName: string, employeeEmail: string) => {
    if (!profile?.company_id) throw new Error('Empresa não encontrada');

    try {
      const code = generateAccessCode();
      
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

      setAccessCodes(prev => [data, ...prev]);
      
      toast({
        title: "Código de acesso criado",
        description: `Código ${code} criado para ${employeeName}`,
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar código';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return { data: null, error: errorMessage };
    }
  };

  const deactivateEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      
      toast({
        title: "Funcionário desativado",
        description: "Funcionário foi desativado do sistema.",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao desativar funcionário';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: errorMessage };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência.",
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchAccessCodes()]);
      setLoading(false);
    };

    if (profile?.company_id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [profile?.company_id]);

  return {
    employees,
    accessCodes,
    loading,
    error,
    createAccessCode,
    deactivateEmployee,
    copyToClipboard,
    refetch: () => Promise.all([fetchEmployees(), fetchAccessCodes()])
  };
};
