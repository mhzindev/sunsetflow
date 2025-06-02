
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useExpensesDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    transactionExpenses: [],
    tableExpenses: [],
    dashboardExpenses: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDebugData = async () => {
      if (!user) return;
      
      try {
        console.log('🔍 Iniciando debug de despesas...');
        
        // 1. Buscar transações que são despesas (usado no dashboard)
        const { data: transactions, error: transError } = await supabase.rpc('get_user_transactions_simple');
        
        if (transError) {
          console.error('❌ Erro ao buscar transações:', transError);
        } else {
          const expenseTransactions = transactions?.filter(t => t.type === 'expense') || [];
          console.log('💰 Transações tipo despesa encontradas:', expenseTransactions.length, expenseTransactions);
          
          // Calcular total dos últimos 30 dias
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentExpenses = expenseTransactions.filter(t => 
            new Date(t.date) >= thirtyDaysAgo && t.status === 'completed'
          );
          
          const totalExpenses = recentExpenses.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
          console.log('📊 Total de despesas (30 dias):', totalExpenses, 'Transações:', recentExpenses);
          
          setDebugInfo(prev => ({
            ...prev,
            transactionExpenses: expenseTransactions,
            dashboardExpenses: totalExpenses
          }));
        }

        // 2. Buscar dados da tabela expenses diretamente
        console.log('🗂️ Buscando dados da tabela expenses...');
        
        const { data: expenses, error: expError } = await supabase
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

        if (expError) {
          console.error('❌ Erro ao buscar expenses:', expError);
          
          // Tentar busca mais simples sem join
          const { data: simpleExpenses, error: simpleError } = await supabase
            .from('expenses')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (simpleError) {
            console.error('❌ Erro na busca simples de expenses:', simpleError);
          } else {
            console.log('📋 Expenses encontradas (busca simples):', simpleExpenses?.length || 0, simpleExpenses);
            setDebugInfo(prev => ({
              ...prev,
              tableExpenses: simpleExpenses || []
            }));
          }
        } else {
          console.log('📋 Expenses encontradas:', expenses?.length || 0, expenses);
          setDebugInfo(prev => ({
            ...prev,
            tableExpenses: expenses || []
          }));
        }

        // 3. Verificar políticas RLS
        console.log('🔐 Verificando usuário atual:', user.id, user.email);
        
      } catch (err) {
        console.error('💥 Erro geral no debug:', err);
        setDebugInfo(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        }));
      } finally {
        setDebugInfo(prev => ({
          ...prev,
          loading: false
        }));
      }
    };

    fetchDebugData();
  }, [user]);

  return debugInfo;
};
