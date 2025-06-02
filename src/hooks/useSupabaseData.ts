import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar transações - MELHORADA
  const fetchTransactions = async () => {
    try {
      console.log('Buscando transações do banco...');
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar transações:', error);
        throw error;
      }
      
      console.log('Transações encontradas:', data?.length || 0, data);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao buscar transações');
      return [];
    }
  };

  // Função para buscar despesas com dados de missões
  const fetchExpenses = async () => {
    try {
      console.log('Buscando despesas do banco...');
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          missions:mission_id(
            title, 
            location, 
            client_name,
            employee_names,
            start_date,
            end_date,
            budget,
            total_expenses
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar despesas:', error);
        throw error;
      }
      
      console.log('Despesas encontradas:', data?.length || 0, data);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      setError('Erro ao buscar despesas');
      return [];
    }
  };

  // Função para buscar pagamentos
  const fetchPayments = async () => {
    try {
      console.log('Buscando pagamentos do banco...');
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          service_providers:provider_id(name, email, phone, service)
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro SQL ao buscar pagamentos:', error);
        throw error;
      }
      
      console.log('Pagamentos encontrados:', data?.length || 0, data);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
      setError('Erro ao buscar pagamentos');
      return [];
    }
  };

  // Função para buscar missões com dados completos
  const fetchMissions = async () => {
    try {
      console.log('Buscando missões do banco...');
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar missões:', error);
        throw error;
      }
      
      console.log('Missões encontradas:', data?.length || 0, data);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar missões:', err);
      setError('Erro ao buscar missões');
      return [];
    }
  };

  // Função para buscar fornecedores - MELHORADA
  const fetchServiceProviders = async () => {
    try {
      console.log('Buscando fornecedores...');
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro SQL ao buscar fornecedores:', error);
        throw error;
      }
      
      console.log('Fornecedores encontrados:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      setError('Erro ao buscar fornecedores');
      return [];
    }
  };

  // Função para buscar clientes
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError('Erro ao buscar clientes');
      return [];
    }
  };

  // Função para buscar contas bancárias
  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contas bancárias:', err);
      setError('Erro ao buscar contas bancárias');
      return [];
    }
  };

  // Função para buscar cartões de crédito
  const fetchCreditCards = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar cartões de crédito:', err);
      setError('Erro ao buscar cartões de crédito');
      return [];
    }
  };

  // Função para inserir transação - MELHORADA
  const insertTransaction = async (transaction: {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    method: string;
    status?: string;
    mission_id?: string;
    receipt?: string;
    tags?: string[];
    account_id?: string;
    account_type?: 'bank_account' | 'credit_card';
  }) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Inserindo transação:', transaction);

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          status: transaction.status || 'completed'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir transação:', error);
        throw error;
      }

      console.log('Transação inserida com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir transação:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir despesa - MELHORADA COM NOVOS CAMPOS
  const insertExpense = async (expense: {
    mission_id?: string;
    category: string;
    description: string;
    amount: number;
    invoice_amount?: number;
    date: string;
    is_advanced?: boolean;
    receipt?: string;
    accommodation_details?: any;
    employee_role?: string;
    travel_km?: number;
    travel_km_rate?: number;
    travel_total_value?: number;
  }) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Inserindo despesa:', expense);

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          employee_id: user.id,
          employee_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          employee_role: expense.employee_role || 'Funcionário',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir despesa:', error);
        throw error;
      }

      console.log('Despesa inserida com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir despesa:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar status de despesa
  const updateExpenseStatus = async (expenseId: string, status: 'pending' | 'approved' | 'reimbursed') => {
    try {
      console.log('Atualizando status da despesa:', expenseId, status);

      const { data, error } = await supabase
        .from('expenses')
        .update({ status })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao atualizar status da despesa:', error);
        throw error;
      }

      console.log('Status da despesa atualizado com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar status da despesa:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir pagamento
  const insertPayment = async (payment: {
    provider_id?: string;
    provider_name: string;
    amount: number;
    due_date: string;
    payment_date?: string;
    status: string;
    type: string;
    description: string;
    installments?: number;
    current_installment?: number;
    tags?: string[];
    notes?: string;
    account_id?: string;
    account_type?: 'bank_account' | 'credit_card';
  }) => {
    try {
      console.log('Inserindo pagamento:', payment);

      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir pagamento:', error);
        throw error;
      }

      console.log('Pagamento inserido com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir pagamento:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar pagamento
  const updatePayment = async (paymentId: string, updates: any) => {
    try {
      console.log('Atualizando pagamento:', paymentId, updates);

      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao atualizar pagamento:', error);
        throw error;
      }

      console.log('Pagamento atualizado com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar pagamento:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir missão
  const insertMission = async (mission: {
    title: string;
    description?: string;
    location: string;
    start_date: string;
    end_date?: string;
    budget?: number;
    client_name?: string;
    client_id?: string;
    assigned_employees?: string[];
    employee_names?: string[];
    status?: string;
  }) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Inserindo missão:', mission);

      const { data, error } = await supabase
        .from('missions')
        .insert({
          ...mission,
          created_by: user.id,
          status: mission.status || 'planning'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir missão:', error);
        throw error;
      }

      console.log('Missão inserida com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir missão:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar missão
  const updateMission = async (missionId: string, updates: any) => {
    try {
      console.log('Atualizando missão:', missionId, updates);

      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', missionId)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao atualizar missão:', error);
        throw error;
      }

      console.log('Missão atualizada com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar missão:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir cliente
  const insertClient = async (client: {
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      console.log('Inserindo cliente:', client);

      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir cliente:', error);
        throw error;
      }

      console.log('Cliente inserido com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir cliente:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir fornecedor - MELHORADA
  const insertServiceProvider = async (provider: {
    name: string;
    email: string;
    phone: string;
    service: string;
    payment_method: string;
    cpf_cnpj?: string;
    address?: string;
    hourly_rate?: number;
  }) => {
    try {
      console.log('Inserindo fornecedor:', provider);

      const { data, error } = await supabase
        .from('service_providers')
        .insert({
          ...provider,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir fornecedor:', error);
        throw error;
      }

      console.log('Fornecedor inserido com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir fornecedor:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir prestador com acesso
  const insertServiceProviderWithAccess = async (provider: {
    name: string;
    email: string;
    phone: string;
    service: string;
    payment_method: string;
    cpf_cnpj?: string;
    address?: string;
    specialties?: string[];
    hourly_rate?: number;
  }, accessData?: {
    access_email: string;
    password: string;
    permissions: any;
  }) => {
    try {
      console.log('Inserindo prestador com acesso:', { provider, accessData });

      // Primeiro inserir o prestador
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          ...provider,
          has_system_access: !!accessData,
          active: true
        })
        .select()
        .single();

      if (providerError) {
        console.error('Erro SQL ao inserir prestador:', providerError);
        throw providerError;
      }

      // Se há dados de acesso, criar o acesso
      if (accessData && providerData) {
        const accessCode = Math.random().toString(36).substr(2, 12).toUpperCase();
        
        const { data: accessResult, error: accessError } = await supabase
          .from('service_provider_access')
          .insert({
            provider_id: providerData.id,
            email: accessData.access_email,
            password_hash: btoa(accessData.password), // Em produção, usar hash apropriado
            access_code: accessCode,
            permissions: accessData.permissions,
            is_active: true
          })
          .select()
          .single();

        if (accessError) {
          console.error('Erro ao criar acesso:', accessError);
          // Em caso de erro, remover o prestador criado
          await supabase.from('service_providers').delete().eq('id', providerData.id);
          throw accessError;
        }

        console.log('Prestador e acesso criados com sucesso:', { providerData, accessResult });
        return { data: { provider: providerData, access: accessResult }, error: null };
      }

      console.log('Prestador criado com sucesso:', providerData);
      return { data: { provider: providerData }, error: null };
    } catch (err) {
      console.error('Erro ao inserir prestador:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para buscar acessos de prestadores
  const fetchProviderAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('service_provider_access')
        .select(`
          *,
          service_providers:provider_id(name, email, phone, service)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar acessos de prestadores:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    fetchTransactions,
    fetchExpenses,
    fetchPayments,
    fetchMissions,
    fetchServiceProviders,
    fetchClients,
    fetchBankAccounts,
    fetchCreditCards,
    insertTransaction,
    insertExpense,
    updateExpenseStatus,
    insertPayment,
    updatePayment,
    insertMission,
    updateMission,
    insertClient,
    insertServiceProvider,
    insertServiceProviderWithAccess,
    fetchProviderAccess
  };
};
