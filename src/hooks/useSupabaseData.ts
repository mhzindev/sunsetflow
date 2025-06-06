import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentCreateData } from '@/types/payment';

export const useSupabaseData = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar transações - OTIMIZADA
  const fetchTransactions = async () => {
    try {
      console.log('Buscando transações usando RPC otimizada...');
      
      const { data, error } = await supabase.rpc('get_user_transactions_simple');

      if (error) {
        console.error('Erro RPC ao buscar transações:', error);
        throw error;
      }
      
      console.log('Transações encontradas via RPC:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      return [];
    }
  };

  // Função para buscar despesas - OTIMIZADA COM FILTRO PARA PRESTADORES
  const fetchExpenses = async () => {
    try {
      console.log('Buscando despesas com filtro por prestador...');
      
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          missions:mission_id(
            title, 
            location, 
            client_name,
            start_date,
            end_date,
            budget,
            total_expenses,
            provider_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar despesas:', error);
        return [];
      }
      
      console.log('Despesas encontradas:', data?.length || 0);
      console.log('Tipo de usuário:', profile?.user_type);
      
      if (profile?.user_type === 'provider') {
        console.log('Usuário é prestador - dados filtrados pelas políticas RLS');
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      return [];
    }
  };

  // Função para buscar pagamentos - CORRIGIDA COM MAPEAMENTO CORRETO
  const fetchPayments = async () => {
    try {
      console.log('Buscando pagamentos com RLS corrigido...');
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          service_providers:provider_id(name, email, phone, service)
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro SQL ao buscar pagamentos:', error);
        return [];
      }
      
      console.log('Dados brutos dos pagamentos:', data);
      
      const mappedPayments = data?.map(payment => ({
        id: payment.id,
        providerId: payment.provider_id,
        providerName: payment.provider_name,
        amount: payment.amount,
        dueDate: payment.due_date,
        paymentDate: payment.payment_date,
        status: payment.status,
        type: payment.type,
        description: payment.description,
        installments: payment.installments,
        currentInstallment: payment.current_installment,
        tags: payment.tags,
        notes: payment.notes,
        serviceProvider: payment.service_providers ? {
          name: payment.service_providers.name,
          email: payment.service_providers.email,
          phone: payment.service_providers.phone,
          service: payment.service_providers.service
        } : null
      })) || [];
      
      console.log('Pagamentos mapeados:', mappedPayments.length);
      console.log('Primeiro pagamento mapeado:', mappedPayments[0]);
      
      return mappedPayments;
    } catch (err) {
      console.error('Erro ao buscar pagamentos:', err);
      return [];
    }
  };

  // Função para buscar missões - ATUALIZADA COM FILTRO PARA PRESTADORES
  const fetchMissions = async () => {
    try {
      console.log('Buscando missões com filtro por prestador...');
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar missões:', error);
        return [];
      }
      
      console.log('Missões encontradas:', data?.length || 0);
      console.log('Tipo de usuário:', profile?.user_type);
      
      if (profile?.user_type === 'provider') {
        console.log('Usuário é prestador - missões filtradas pelas políticas RLS');
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar missões:', err);
      return [];
    }
  };

  // Função para buscar fornecedores - ATUALIZADA
  const fetchServiceProviders = async () => {
    try {
      console.log('Buscando prestadores de serviço...');
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro SQL ao buscar prestadores:', error);
        return [];
      }
      
      console.log('Prestadores encontrados:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar prestadores:', err);
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

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }
      
      console.log('Clientes encontrados:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      throw err;
    }
  };

  // Função para buscar contas bancárias
  const fetchBankAccounts = async () => {
    try {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contas bancárias:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contas bancárias:', err);
      return [];
    }
  };

  // Função para buscar cartões de crédito
  const fetchCreditCards = async () => {
    try {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar cartões de crédito:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar cartões de crédito:', err);
      return [];
    }
  };

  // Função para buscar funcionários - REMOVIDA (não mais necessária)
  const fetchEmployees = async () => {
    try {
      console.log('Aviso: fetchEmployees foi removida. Use fetchServiceProviders para prestadores de serviço.');
      return [];
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      return [];
    }
  };

  // Função para inserir transação - CORRIGIDA COM VALIDAÇÃO MELHORADA
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
      if (!user) {
        console.error('insertTransaction: Usuário não autenticado');
        return { data: null, error: 'Usuário não autenticado' };
      }

      console.log('insertTransaction: Iniciando inserção:', transaction);

      if (!transaction.description || transaction.description.trim().length === 0) {
        return { data: null, error: 'Descrição é obrigatória' };
      }

      if (!transaction.amount || transaction.amount <= 0) {
        return { data: null, error: 'Valor deve ser maior que zero' };
      }

      const { data, error } = await supabase.rpc('insert_transaction_with_casting', {
        p_type: transaction.type,
        p_category: transaction.category,
        p_amount: transaction.amount,
        p_description: transaction.description.trim(),
        p_date: transaction.date,
        p_method: transaction.method,
        p_status: transaction.status || 'completed',
        p_user_id: user.id,
        p_user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        p_mission_id: transaction.mission_id,
        p_receipt: transaction.receipt,
        p_tags: transaction.tags,
        p_account_id: transaction.account_id,
        p_account_type: transaction.account_type
      });

      if (error) {
        console.error('insertTransaction: Erro RPC:', error);
        return { data: null, error: error.message };
      }

      console.log('insertTransaction: Transação inserida com sucesso via RPC:', data);
      return { data: data?.[0], error: null };
    } catch (err) {
      console.error('insertTransaction: Erro inesperado:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir despesa - MELHORADA COM PRESTADOR
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
      console.log('Perfil do usuário:', profile);

      const employeeName = profile?.user_type === 'provider' 
        ? profile.name 
        : user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          employee_id: user.id,
          employee_name: employeeName,
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

  // Função para inserir pagamento - VERSÃO ATUALIZADA PARA USAR A NOVA FUNÇÃO ENHANCED
  const insertPayment = async (paymentData: PaymentCreateData) => {
    try {
      console.log('insertPayment: Iniciando inserção de pagamento com validação aprimorada:', paymentData);
      
      // Validação rigorosa no frontend antes de enviar
      if (!paymentData.provider_id) {
        return { data: null, error: 'provider_id é obrigatório para criar pagamentos' };
      }

      if (!paymentData.provider_name || paymentData.provider_name.trim().length === 0) {
        return { data: null, error: 'Nome do prestador é obrigatório' };
      }

      if (!paymentData.amount || paymentData.amount <= 0) {
        return { data: null, error: 'Valor deve ser maior que zero' };
      }

      if (!paymentData.description || paymentData.description.trim().length === 0) {
        return { data: null, error: 'Descrição é obrigatória' };
      }

      // Validação crítica: se status completed, deve ter conta
      if (paymentData.status === 'completed' && (!paymentData.account_id || !paymentData.account_type)) {
        return { data: null, error: 'account_id e account_type são obrigatórios para pagamentos completed' };
      }

      // Usar a nova função enhanced que valida provider_id obrigatório
      const { data, error } = await supabase.rpc('insert_payment_enhanced', {
        p_provider_id: paymentData.provider_id,
        p_provider_name: paymentData.provider_name.trim(),
        p_amount: paymentData.amount,
        p_due_date: paymentData.due_date,
        p_payment_date: paymentData.payment_date,
        p_status: paymentData.status,
        p_type: paymentData.type,
        p_description: paymentData.description.trim(),
        p_installments: paymentData.installments,
        p_current_installment: paymentData.current_installment,
        p_tags: paymentData.tags,
        p_notes: paymentData.notes,
        p_account_id: paymentData.account_id,
        p_account_type: paymentData.account_type
      });

      if (error) {
        console.error('insertPayment: Erro no RPC insert_payment_enhanced:', error);
        return { data: null, error: error.message || 'Erro ao inserir pagamento' };
      }

      console.log('insertPayment: Pagamento inserido com sucesso via enhanced RPC:', data);
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error('insertPayment: Erro inesperado:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  };

  // CORRIGIDO: Função updatePayment melhorada com logs detalhados e validação
  const updatePayment = async (paymentId: string, updates: any) => {
    try {
      console.log('=== updatePayment: Iniciando atualização ===');
      console.log('Payment ID:', paymentId);
      console.log('Updates:', updates);
      
      // Validação dos dados
      if (!paymentId || paymentId.trim().length === 0) {
        console.error('updatePayment: ID do pagamento é obrigatório');
        return { data: null, error: 'ID do pagamento é obrigatório' };
      }

      // Converter snake_case para o formato correto do banco se necessário
      const dbUpdates = {
        ...updates,
        // Garantir que campos de data estejam no formato correto
        ...(updates.payment_date && { payment_date: updates.payment_date }),
        ...(updates.due_date && { due_date: updates.due_date }),
        // Atualizar timestamp
        updated_at: new Date().toISOString()
      };

      console.log('updatePayment: Dados formatados para o banco:', dbUpdates);

      const { data, error } = await supabase
        .from('payments')
        .update(dbUpdates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('updatePayment: Erro SQL ao atualizar pagamento:', error);
        console.error('updatePayment: Detalhes do erro:', error.message, error.details, error.hint);
        return { data: null, error: error.message };
      }

      console.log('updatePayment: Pagamento atualizado com sucesso no banco:', data);
      console.log('=== updatePayment: Finalizado com sucesso ===');
      return { data, error: null };
    } catch (err) {
      console.error('updatePayment: Erro inesperado:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir missão - ATUALIZADA PARA PRESTADORES
  const insertMission = async (mission: {
    title: string;
    description?: string;
    location: string;
    start_date: string;
    end_date?: string;
    budget?: number;
    service_value?: number;
    company_percentage?: number;
    provider_percentage?: number;
    client_name?: string;
    client_id?: string;
    assigned_providers?: string[];
    status?: string;
    provider_id?: string;
  }) => {
    try {
      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: 'Usuário não autenticado' };
      }

      console.log('Inserindo missão:', mission);
      console.log('Perfil do usuário:', profile);

      const finalMission = {
        ...mission,
        created_by: user.id,
        status: mission.status || 'planning',
        is_approved: false
      };

      if (profile?.user_type === 'provider' && profile.provider_id) {
        finalMission.provider_id = profile.provider_id;
      }

      const { data, error } = await supabase
        .from('missions')
        .insert(finalMission)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir missão:', error);
        return { data: null, error: error.message };
      }

      console.log('Missão inserida com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir missão:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar missão - CORRIGIDA
  const updateMission = async (missionId: string, updates: any) => {
    try {
      console.log('Atualizando missão:', missionId, updates);

      const validUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('missions')
        .update(validUpdates)
        .eq('id', missionId)
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao atualizar missão:', error);
        return { data: null, error: error.message };
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

  // Função para inserir fornecedor - CORRIGIDA
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
      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: 'Usuário não autenticado' };
      }

      console.log('Inserindo prestador de serviço:', provider);

      const { data, error } = await supabase
        .from('service_providers')
        .insert({
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          service: provider.service,
          payment_method: provider.payment_method,
          cpf_cnpj: provider.cpf_cnpj || null,
          address: provider.address || null,
          hourly_rate: provider.hourly_rate || null,
          active: true,
          has_system_access: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erro SQL ao inserir prestador:', error);
        return { data: null, error: error.message };
      }

      console.log('Prestador inserido com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao inserir prestador:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para inserir prestador com acesso - ATUALIZADA
  const insertServiceProviderWithAccess = async (provider: any, accessData?: {
    access_email: string;
    password: string;
    permissions: any;
  }) => {
    try {
      if (!user) {
        console.error('Usuário não autenticado');
        return { data: null, error: 'Usuário não autenticado' };
      }

      console.log('Inserindo prestador com acesso:', { provider, accessData });

      const { data: existingProvider, error: checkError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('email', provider.email);

      if (checkError) {
        console.error('Erro ao verificar prestador existente:', checkError);
        return { data: null, error: checkError.message };
      }

      if (existingProvider && existingProvider.length > 0) {
        return { data: null, error: 'Já existe um prestador com este email' };
      }

      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          service: provider.service,
          payment_method: provider.payment_method,
          cpf_cnpj: provider.cpf_cnpj || null,
          address: provider.address || null,
          hourly_rate: provider.hourly_rate || null,
          active: true,
          has_system_access: !!accessData
        })
        .select()
        .single();

      if (providerError) {
        console.error('Erro SQL ao inserir prestador:', providerError);
        return { data: null, error: providerError.message };
      }

      if (accessData && providerData) {
        await supabase
          .from('service_provider_access')
          .delete()
          .eq('provider_id', providerData.id);

        const accessCode = Math.random().toString(36).substr(2, 12).toUpperCase();
        
        const { data: accessResult, error: accessError } = await supabase
          .from('service_provider_access')
          .insert({
            provider_id: providerData.id,
            email: accessData.access_email,
            password_hash: btoa(accessData.password),
            access_code: accessCode,
            permissions: accessData.permissions,
            is_active: true
          })
          .select()
          .single();

        if (accessError) {
          console.error('Erro ao criar acesso:', accessError);
          await supabase.from('service_providers').delete().eq('id', providerData.id);
          return { data: null, error: accessError.message };
        }

        console.log('Prestador e acesso criados com sucesso:', { providerData, accessResult });
        return { data: { provider: providerData, access: accessResult }, error: null };
      }

      console.log('Prestador criado com sucesso:', providerData);
      return { data: { provider: providerData }, error: null };
    } catch (err) {
      console.error('Erro ao inserir prestador com acesso:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para buscar acessos de prestadores - CORRIGIDA
  const fetchProviderAccess = async () => {
    try {
      console.log('Buscando acessos de prestadores...');
      const { data, error } = await supabase
        .from('service_provider_access')
        .select(`
          *,
          service_providers:provider_id(name, email, phone, service)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar acessos:', error);
        return [];
      }
      
      console.log('Acessos encontrados:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar acessos de prestadores:', err);
      return [];
    }
  };

  // Função para buscar dados com retry em caso de erro RLS
  const fetchDataWithRetry = async (fetchFunction: () => Promise<any>, tableName: string, maxRetries = 2) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fetchFunction();
        return result;
      } catch (error: any) {
        console.warn(`Tentativa ${attempt + 1} falhou para ${tableName}:`, error);
        
        if (attempt === maxRetries) {
          console.error(`Todas as tentativas falharam para ${tableName}`);
          return [];
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  // Função para excluir prestador e seus acessos
  const deleteServiceProviderWithAccess = async (providerId: string) => {
    try {
      console.log('Excluindo prestador e acessos:', providerId);

      const { error: accessError } = await supabase
        .from('service_provider_access')
        .delete()
        .eq('provider_id', providerId);

      if (accessError) {
        console.error('Erro ao excluir acessos:', accessError);
        throw accessError;
      }

      const { error: providerError } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', providerId);

      if (providerError) {
        console.error('Erro ao excluir prestador:', providerError);
        throw providerError;
      }

      console.log('Prestador e acessos excluídos com sucesso');
      return { data: true, error: null };
    } catch (err) {
      console.error('Erro ao excluir prestador:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para buscar receitas pendentes - NOVA
  const fetchPendingRevenues = async () => {
    try {
      console.log('Buscando receitas pendentes...');
      
      const { data, error } = await supabase
        .from('pending_revenues')
        .select(`
          *,
          missions:mission_id(title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar receitas pendentes:', error);
        return [];
      }
      
      console.log('Receitas pendentes encontradas:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar receitas pendentes:', err);
      return [];
    }
  };

  // Função para converter receita pendente em recebida - CORRIGIDA
  const convertPendingRevenue = async (pendingRevenueId: string, accountId: string, accountType: string) => {
    try {
      console.log('Convertendo receita pendente:', { pendingRevenueId, accountId, accountType });

      const { data, error } = await supabase.rpc('convert_pending_to_received_revenue', {
        pending_revenue_id: pendingRevenueId,
        account_id: accountId,
        account_type: accountType
      });

      if (error) {
        console.error('Erro RPC ao converter receita:', error);
        return { data: null, error: error.message };
      }

      console.log('Receita convertida com sucesso - Valor total registrado:', data?.total_amount);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao converter receita:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para atualizar saldo do prestador - NOVA
  const updateProviderBalance = async (providerId: string, amount: number, operation: 'add' | 'subtract' = 'add') => {
    try {
      console.log('Atualizando saldo do prestador:', { providerId, amount, operation });

      const { data: currentProvider, error: fetchError } = await supabase
        .from('service_providers')
        .select('current_balance')
        .eq('id', providerId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar prestador:', fetchError);
        return { data: null, error: fetchError.message };
      }

      const currentBalance = currentProvider.current_balance || 0;
      const newBalance = operation === 'add' 
        ? currentBalance + amount 
        : currentBalance - amount;

      const { data, error } = await supabase
        .from('service_providers')
        .update({ current_balance: newBalance })
        .eq('id', providerId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar saldo:', error);
        return { data: null, error: error.message };
      }

      console.log('Saldo atualizado com sucesso:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao atualizar saldo do prestador:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  // Função para buscar receitas confirmadas - NOVA
  const fetchConfirmedRevenues = async () => {
    try {
      console.log('Buscando receitas confirmadas...');
      
      const { data, error } = await supabase
        .from('confirmed_revenues')
        .select(`
          *,
          missions:mission_id(title, location)
        `)
        .order('received_date', { ascending: false });

      if (error) {
        console.error('Erro SQL ao buscar receitas confirmadas:', error);
        return [];
      }
      
      console.log('Receitas confirmadas encontradas:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar receitas confirmadas:', err);
      return [];
    }
  };

  // Função para converter receita pendente em confirmada - ATUALIZADA
  const convertPendingToConfirmedRevenue = async (
    pendingRevenueId: string, 
    accountId: string, 
    accountType: string, 
    paymentMethod: string = 'transfer'
  ) => {
    try {
      console.log('Convertendo receita pendente para confirmada:', { 
        pendingRevenueId, 
        accountId, 
        accountType, 
        paymentMethod 
      });

      const { data, error } = await supabase.rpc('convert_pending_to_confirmed_revenue', {
        pending_revenue_id: pendingRevenueId,
        account_id: accountId,
        account_type: accountType,
        payment_method: paymentMethod
      });

      if (error) {
        console.error('Erro RPC ao converter receita para confirmada:', error);
        return { data: null, error: error.message };
      }

      console.log('Receita convertida para confirmada com sucesso - Pagamentos dos prestadores criados automaticamente:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Erro ao converter receita para confirmada:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
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
    fetchEmployees,
    fetchPendingRevenues,
    convertPendingRevenue,
    updateProviderBalance,
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
    fetchProviderAccess,
    deleteServiceProviderWithAccess,
    fetchConfirmedRevenues,
    convertPendingToConfirmedRevenue
  };
};
