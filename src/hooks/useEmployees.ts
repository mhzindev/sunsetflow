
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastFeedback();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Buscando funcionários...');
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro SQL ao buscar funcionários:', error);
        throw error;
      }
      
      console.log('Funcionários encontrados:', data?.length || 0, data);
      setEmployees(data || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      showError('Erro', 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const insertEmployee = async (employee: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  }) => {
    try {
      console.log('Inserindo funcionário:', employee);

      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employee,
          role: employee.role || 'employee',
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir funcionário:', error);
        throw error;
      }

      console.log('Funcionário inserido com sucesso:', data);
      await fetchEmployees(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir funcionário:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    insertEmployee
  };
};
