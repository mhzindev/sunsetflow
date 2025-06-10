
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  pendingPayments: number;
  confirmedRevenues: number;
}

export const FinancialSummarySecure = () => {
  const [data, setData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    confirmedRevenues: 0
  });
  const [loading, setLoading] = useState(true);
  const { isValidated, companyId } = useCompanyIsolation();
  const { showError } = useToastFeedback();

  useEffect(() => {
    if (isValidated && companyId) {
      loadFinancialData();
    }
  }, [isValidated, companyId]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Se não há company_id, mostrar zeros
      if (!companyId) {
        setData({
          totalIncome: 0,
          totalExpenses: 0,
          pendingPayments: 0,
          confirmedRevenues: 0
        });
        return;
      }

      // Buscar dados filtrados por company_id
      const [transactionsResult, paymentsResult, revenuesResult] = await Promise.all([
        // Transações de receita
        supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'income')
          .eq('status', 'completed')
          .eq('company_id', companyId),

        // Pagamentos pendentes
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'pending')
          .eq('company_id', companyId),

        // Receitas confirmadas
        supabase
          .from('confirmed_revenues')
          .select('total_amount'),
      ]);

      const totalIncome = transactionsResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const pendingPayments = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Para receitas confirmadas, filtrar por missões da empresa
      const { data: companyRevenues } = await supabase
        .from('confirmed_revenues')
        .select(`
          total_amount,
          missions!inner(
            created_by,
            profiles!inner(company_id)
          )
        `)
        .eq('missions.profiles.company_id', companyId);

      const confirmedRevenues = companyRevenues?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

      // Despesas da empresa (via transactions)
      const { data: expenses } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense')
        .eq('company_id', companyId);

      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      setData({
        totalIncome,
        totalExpenses,
        pendingPayments,
        confirmedRevenues
      });

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      showError('Erro', 'Erro ao carregar resumo financeiro');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidated) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carregando...</p>
                <p className="text-2xl font-bold text-gray-400">---</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Receita Total</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '---' : formatCurrency(data.totalIncome)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
            <p className="text-2xl font-bold text-red-600">
              {loading ? '---' : formatCurrency(data.totalExpenses)}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? '---' : formatCurrency(data.pendingPayments)}
            </p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Receitas Confirmadas</p>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '---' : formatCurrency(data.confirmedRevenues)}
            </p>
          </div>
          <Wallet className="h-8 w-8 text-blue-600" />
        </div>
      </Card>
    </div>
  );
};
