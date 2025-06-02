
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FinancialDashboardData {
  monthlyIncome: number;
  monthlyExpenses: number;
  bankBalance: number;
  creditAvailable: number;
  creditUsed: number;
  totalResources: number;
  totalBalance: number;
  pendingPayments: number;
  approvedExpenses: number;
}

export const useFinancialDashboard = () => {
  const [data, setData] = useState<FinancialDashboardData>({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    bankBalance: 0,
    creditAvailable: 0,
    creditUsed: 0,
    totalResources: 0,
    totalBalance: 0,
    pendingPayments: 0,
    approvedExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Buscando dados financeiros do dashboard...');
      
      // Tentar usar a RPC primeiro
      const { data: result, error: rpcError } = await supabase.rpc('get_financial_dashboard_data');

      if (rpcError) {
        console.warn('RPC falhou, tentando busca manual:', rpcError);
        
        // Fallback: buscar dados manualmente se a RPC falhar
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Buscar transações dos últimos 30 dias
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('type, amount')
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .eq('status', 'completed');

        if (transError) {
          console.error('Erro ao buscar transações:', transError);
          throw new Error('Falha ao carregar dados financeiros');
        }

        // Calcular valores manualmente
        const monthlyIncome = transactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        const monthlyExpenses = transactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        setData({
          monthlyIncome,
          monthlyExpenses,
          bankBalance: 0,
          creditAvailable: 0,
          creditUsed: 0,
          totalResources: 0,
          totalBalance: 0,
          pendingPayments: 0,
          approvedExpenses: 0,
        });
      } else {
        console.log('Dados financeiros carregados via RPC:', result);
        setData(result || {
          monthlyIncome: 0,
          monthlyExpenses: 0,
          bankBalance: 0,
          creditAvailable: 0,
          creditUsed: 0,
          totalResources: 0,
          totalBalance: 0,
          pendingPayments: 0,
          approvedExpenses: 0,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchFinancialData
  };
};
