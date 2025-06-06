
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinancial } from '@/contexts/FinancialContext';

interface HealthIndicator {
  metric: string;
  value: string;
  status: 'good' | 'warning' | 'danger';
  description: string;
  benchmark: string;
  tooltip: string;
}

interface RiskAnalysis {
  risk: string;
  level: 'low' | 'medium' | 'high';
  impact: string;
  description: string;
  recommendation: string;
  tooltip: string;
}

interface Opportunity {
  opportunity: string;
  potential: string;
  description: string;
  timeframe: string;
  tooltip: string;
}

export const useCashFlowAnalysis = () => {
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicator[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const { data } = useFinancial();

  useEffect(() => {
    calculateAnalysis();
  }, [data]);

  const calculateAnalysis = async () => {
    if (!data) return;

    try {
      setLoading(true);

      // Calcular dados financeiros
      const totalBalance = calculateTotalBalance();
      const monthlyExpenses = calculateMonthlyExpenses();
      const monthlyIncome = calculateMonthlyIncome();
      const liquidityRatio = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
      const cashDays = monthlyExpenses > 0 ? Math.floor(totalBalance / (monthlyExpenses / 30)) : 0;
      const safetyMargin = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

      // Buscar dados de concentração de clientes
      const clientConcentration = await calculateClientConcentration();
      const pendingRevenues = await calculatePendingRevenues();

      // Construir indicadores de saúde
      const indicators: HealthIndicator[] = [
        {
          metric: 'Liquidez Corrente',
          value: liquidityRatio.toFixed(1),
          status: liquidityRatio >= 2 ? 'good' : liquidityRatio >= 1 ? 'warning' : 'danger',
          description: 'Capacidade de pagamento a curto prazo',
          benchmark: 'Ideal: > 2.0',
          tooltip: 'Indica quantas vezes a empresa consegue pagar suas despesas mensais com os recursos disponíveis.'
        },
        {
          metric: 'Dias de Caixa',
          value: cashDays.toString(),
          status: cashDays >= 60 ? 'good' : cashDays >= 30 ? 'warning' : 'danger',
          description: 'Dias de operação com o caixa atual',
          benchmark: 'Ideal: > 60 dias',
          tooltip: 'Mostra quantos dias a empresa consegue operar com o dinheiro em caixa atual.'
        },
        {
          metric: 'Margem de Segurança',
          value: `${safetyMargin.toFixed(1)}%`,
          status: safetyMargin >= 15 ? 'good' : safetyMargin >= 5 ? 'warning' : 'danger',
          description: 'Reserva em relação às despesas mensais',
          benchmark: 'Ideal: > 15%',
          tooltip: 'Percentual do faturamento mantido como reserva de segurança.'
        },
        {
          metric: 'Receitas Pendentes',
          value: `R$ ${(pendingRevenues / 1000).toFixed(0)}k`,
          status: pendingRevenues <= monthlyIncome ? 'good' : pendingRevenues <= monthlyIncome * 2 ? 'warning' : 'danger',
          description: 'Valor total de receitas não confirmadas',
          benchmark: 'Ideal: < 1x receita mensal',
          tooltip: 'Total de receitas pendentes de confirmação que podem impactar o fluxo de caixa.'
        }
      ];

      // Construir análise de riscos
      const risks: RiskAnalysis[] = [
        {
          risk: 'Concentração de Clientes',
          level: clientConcentration.percentage >= 70 ? 'high' : clientConcentration.percentage >= 50 ? 'medium' : 'low',
          impact: clientConcentration.percentage >= 70 ? 'Alto' : clientConcentration.percentage >= 50 ? 'Médio' : 'Baixo',
          description: `${clientConcentration.percentage.toFixed(1)}% das receitas vêm de ${clientConcentration.topClientsCount} cliente(s) principais`,
          recommendation: clientConcentration.percentage >= 50 ? 'Diversificar base de clientes urgentemente' : 'Manter estratégia atual de diversificação',
          tooltip: 'Alta concentração pode comprometer o fluxo de caixa se algum cliente atrasar pagamentos.'
        },
        {
          risk: 'Excesso de Liquidez',
          level: cashDays > 365 ? 'medium' : 'low',
          impact: cashDays > 365 ? 'Médio' : 'Baixo',
          description: `Caixa atual cobre ${cashDays} dias de operação`,
          recommendation: cashDays > 365 ? 'Considerar investimentos de baixo risco' : 'Liquidez adequada',
          tooltip: 'Excesso de dinheiro parado pode representar perda de oportunidade de rentabilidade.'
        },
        {
          risk: 'Receitas Pendentes',
          level: pendingRevenues > monthlyIncome * 2 ? 'high' : pendingRevenues > monthlyIncome ? 'medium' : 'low',
          impact: pendingRevenues > monthlyIncome * 2 ? 'Alto' : pendingRevenues > monthlyIncome ? 'Médio' : 'Baixo',
          description: `R$ ${(pendingRevenues / 1000).toFixed(0)}k em receitas aguardando confirmação`,
          recommendation: 'Acelerar processo de confirmação de receitas',
          tooltip: 'Receitas pendentes podem afetar a previsibilidade do fluxo de caixa.'
        }
      ];

      // Construir oportunidades
      const opps: Opportunity[] = [
        {
          opportunity: 'Antecipação de Recebíveis',
          potential: `R$ ${(pendingRevenues * 0.95 / 1000).toFixed(0)}k`,
          description: 'Negociar desconto para pagamento antecipado de receitas pendentes',
          timeframe: '15-30 dias',
          tooltip: 'Oferecer desconto aos clientes em troca de pagamento antecipado melhora o fluxo de caixa.'
        }
      ];

      if (cashDays > 180) {
        opps.push({
          opportunity: 'Investimento de Sobras',
          potential: `R$ ${((totalBalance * 0.1 * 0.13) / 12).toFixed(0)}/mês`,
          description: 'Aplicar parte do excedente de caixa em investimentos seguros',
          timeframe: 'Imediato',
          tooltip: 'Aplicar recursos excedentes gera receita adicional sem comprometer a liquidez.'
        });
      }

      if (clientConcentration.percentage >= 50) {
        opps.push({
          opportunity: 'Diversificação de Clientes',
          potential: `+${(100 - clientConcentration.percentage).toFixed(0)}% segurança`,
          description: 'Buscar novos clientes para reduzir dependência dos atuais',
          timeframe: '3-6 meses',
          tooltip: 'Diversificar a base de clientes reduz riscos e aumenta estabilidade financeira.'
        });
      }

      setHealthIndicators(indicators);
      setRiskAnalysis(risks);
      setOpportunities(opps);

    } catch (error) {
      console.error('Erro ao calcular análise de fluxo de caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    const bankBalance = data.accounts?.filter(acc => !('limit' in acc))
      .reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
    const creditAvailable = data.accounts?.filter(acc => 'limit' in acc)
      .reduce((sum, acc) => sum + (acc.available_limit || 0), 0) || 0;
    return bankBalance + creditAvailable;
  };

  const calculateMonthlyExpenses = () => {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    return data.transactions?.filter(t => 
      t.type === 'expense' && 
      t.status === 'completed' && 
      new Date(t.date) >= startOfMonth
    ).reduce((sum, t) => sum + t.amount, 0) || 0;
  };

  const calculateMonthlyIncome = () => {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    return data.transactions?.filter(t => 
      t.type === 'income' && 
      t.status === 'completed' && 
      new Date(t.date) >= startOfMonth
    ).reduce((sum, t) => sum + t.amount, 0) || 0;
  };

  const calculateClientConcentration = async () => {
    try {
      const { data: revenues } = await supabase
        .from('confirmed_revenues')
        .select('client_name, total_amount');

      if (!revenues || revenues.length === 0) {
        return { percentage: 0, topClientsCount: 0 };
      }

      const clientTotals = revenues.reduce((acc, revenue) => {
        const clientName = revenue.client_name || 'Cliente não especificado';
        const amount = Number(revenue.total_amount) || 0;
        acc[clientName] = (acc[clientName] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      const totalRevenue = Object.values(clientTotals).reduce((sum, amount) => sum + amount, 0);
      const sortedClients = Object.entries(clientTotals)
        .sort(([,a], [,b]) => b - a);

      if (sortedClients.length === 0 || totalRevenue === 0) {
        return { percentage: 0, topClientsCount: 0 };
      }

      const topClient = sortedClients[0];
      const topClientPercentage = (topClient[1] / totalRevenue) * 100;

      return {
        percentage: topClientPercentage,
        topClientsCount: 1
      };
    } catch (error) {
      console.error('Erro ao calcular concentração de clientes:', error);
      return { percentage: 0, topClientsCount: 0 };
    }
  };

  const calculatePendingRevenues = async () => {
    try {
      const { data: pending } = await supabase
        .from('pending_revenues')
        .select('total_amount')
        .eq('status', 'pending');

      return pending?.reduce((sum, revenue) => {
        const amount = Number(revenue.total_amount) || 0;
        return sum + amount;
      }, 0) || 0;
    } catch (error) {
      console.error('Erro ao calcular receitas pendentes:', error);
      return 0;
    }
  };

  return {
    healthIndicators,
    riskAnalysis,
    opportunities,
    loading,
    refetch: calculateAnalysis
  };
};
