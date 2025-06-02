
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
  const { showError, showSuccess } = useToastFeedback();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Buscando funcionários usando função otimizada...');
      
      // Usar nova função SECURITY DEFINER para evitar problemas de RLS
      const { data, error } = await supabase.rpc('get_active_employees');

      if (error) {
        console.error('Erro ao buscar funcionários via RPC:', error);
        
        // Fallback: tentar busca direta
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('employees')
          .select('*')
          .eq('active', true)
          .order('name', { ascending: true });

        if (fallbackError) {
          console.error('Erro na busca fallback:', fallbackError);
          throw fallbackError;
        }
        
        console.log('Funcionários encontrados via fallback:', fallbackData?.length || 0);
        setEmployees(fallbackData || []);
      } else {
        console.log('Funcionários encontrados via RPC:', data?.length || 0);
        setEmployees(data || []);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      showError('Erro', 'Erro ao carregar funcionários');
      setEmployees([]); // Garantir array vazio em caso de erro
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
      showSuccess('Sucesso', 'Funcionário adicionado com sucesso');
      await fetchEmployees(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir funcionário:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showError('Erro', 'Erro ao adicionar funcionário');
      return { data: null, error: errorMessage };
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
