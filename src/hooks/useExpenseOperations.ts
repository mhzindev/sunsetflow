
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';

export const useExpenseOperations = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastFeedback();
  const { profile } = useAuth();

  const createExpense = async (expenseData: any) => {
    if (!profile?.id) {
      showError('Erro de Acesso', 'Usuário não autenticado');
      return null;
    }

    if (!profile?.company_id) {
      showError('Erro de Acesso', 'Usuário não está associado a nenhuma empresa');
      return null;
    }

    try {
      setLoading(true);

      // Garantir que employee_id seja o usuário atual
      const dataWithEmployee = {
        ...expenseData,
        employee_id: profile.id, // Sempre usar o ID do usuário logado
        employee_name: profile.name
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([dataWithEmployee])
        .select()
        .single();

      if (error) throw error;

      showSuccess('Sucesso', 'Despesa criada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      showError('Erro', 'Erro ao criar despesa');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createExpense,
    loading
  };
};
