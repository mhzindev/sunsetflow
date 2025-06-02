
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
      console.log('Buscando dados financeiros do dashboard...');
      
      const { data: result, error } = await supabase.rpc('get_financial_dashboard_data');

      if (error) {
        console.error('Erro ao buscar dados financeiros:', error);
        throw error;
      }

      console.log('Dados financeiros carregados:', result);
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
      setError(null);
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
