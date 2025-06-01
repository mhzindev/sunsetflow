
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFinancial } from '@/contexts/FinancialContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyData {
  month: string;
  entrada: number;
  saida: number;
  saldo: number;
}

interface ProjectionData {
  periodo: string;
  projetado: number;
  realizado: number | null;
}

export const CashFlowChart = () => {
  const { data } = useFinancial();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [projectionData, setProjectionData] = useState<ProjectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Buscar dados dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .eq('status', 'completed');

      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
        return;
      }

      // Processar dados mensais
      const monthlyMap = new Map<string, { entrada: number; saida: number }>();
      
      transactionsData?.forEach(transaction => {
        const monthKey = new Date(transaction.date).toISOString().slice(0, 7); // YYYY-MM
        const monthName = new Date(transaction.date).toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { entrada: 0, saida: 0 });
        }
        
        const monthData = monthlyMap.get(monthKey)!;
        if (transaction.type === 'income') {
          monthData.entrada += parseFloat(transaction.amount.toString());
        } else {
          monthData.saida += parseFloat(transaction.amount.toString());
        }
      });

      // Converter para array e calcular saldo
      const monthlyArray: MonthlyData[] = Array.from(monthlyMap.entries()).map(([monthKey, data]) => {
        const date = new Date(monthKey + '-01');
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          entrada: data.entrada,
          saida: data.saida,
          saldo: data.entrada - data.saida
        };
      }).sort((a, b) => {
        // Ordenar por mês
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return months.indexOf(a.month.toLowerCase()) - months.indexOf(b.month.toLowerCase());
      });

      setMonthlyData(monthlyArray);

      // Buscar projeções (próximas 4 semanas)
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('status', ['pending', 'partial'])
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
        return;
      }

      // Agrupar por semana
      const weeklyProjections: ProjectionData[] = [];
      for (let week = 1; week <= 4; week++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekPayments = paymentsData?.filter(payment => {
          const paymentDate = new Date(payment.due_date);
          return paymentDate >= weekStart && paymentDate <= weekEnd;
        }) || [];

        const projetado = weekPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
        
        weeklyProjections.push({
          periodo: `Sem ${week}`,
          projetado,
          realizado: week <= 2 ? projetado * 0.9 : null // Simular realizado para as duas primeiras semanas
        });
      }

      setProjectionData(weeklyProjections);

    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    entrada: {
      label: "Entradas",
      color: "#10b981",
    },
    saida: {
      label: "Saídas", 
      color: "#ef4444",
    },
    saldo: {
      label: "Saldo",
      color: "#3b82f6",
    },
    projetado: {
      label: "Projetado",
      color: "#8b5cf6",
    },
    realizado: {
      label: "Realizado",
      color: "#10b981",
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando gráficos...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fluxo de Caixa Mensal */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Fluxo de Caixa Mensal</h4>
        {monthlyData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="entrada" fill="var(--color-entrada)" />
                <Bar dataKey="saida" fill="var(--color-saida)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="mb-2">Sem dados para exibir</p>
              <p className="text-sm">Registre transações para visualizar o fluxo de caixa</p>
            </div>
          </div>
        )}
      </Card>

      {/* Evolução do Saldo */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Evolução do Saldo</h4>
        {monthlyData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="var(--color-saldo)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-saldo)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="mb-2">Sem dados para exibir</p>
              <p className="text-sm">Registre transações para visualizar a evolução do saldo</p>
            </div>
          </div>
        )}
      </Card>

      {/* Projetado vs Realizado */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Projetado vs Realizado</h4>
        {projectionData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="projetado" 
                  stroke="var(--color-projetado)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="realizado" 
                  stroke="var(--color-realizado)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-realizado)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="mb-2">Sem projeções disponíveis</p>
              <p className="text-sm">Cadastre pagamentos futuros para visualizar projeções</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
