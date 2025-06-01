
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFinancial } from '@/contexts/FinancialContext';

interface CashFlowProjection {
  month: string;
  type: string;
  amount: number;
  description: string;
}

export const CashFlowProjections = () => {
  const [projections, setProjections] = useState<CashFlowProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const { data } = useFinancial();

  useEffect(() => {
    fetchProjections();
  }, []);

  const fetchProjections = async () => {
    try {
      setLoading(true);
      
      // Buscar projeções usando a view criada
      const { data: projectionsData, error } = await supabase
        .from('cash_flow_projections')
        .select('*')
        .order('month');

      if (error) {
        console.error('Erro ao buscar projeções:', error);
        setProjections([]);
      } else {
        setProjections(projectionsData || []);
      }
    } catch (err) {
      console.error('Erro ao carregar projeções:', err);
      setProjections([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Calcular totais por mês
  const monthlyTotals = projections.reduce((acc, proj) => {
    const monthKey = proj.month;
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0, month: monthKey };
    }
    
    if (proj.type === 'income') {
      acc[monthKey].income += proj.amount;
    } else {
      acc[monthKey].expenses += proj.amount;
    }
    
    return acc;
  }, {} as Record<string, { income: number; expenses: number; month: string }>);

  const monthlyData = Object.values(monthlyTotals);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando projeções...</p>
        </div>
      </Card>
    );
  }

  if (projections.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <CalendarDays className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Sem Projeções Disponíveis</h3>
          <p className="text-slate-600 mb-4">
            Não há pagamentos ou receitas futuras cadastradas para gerar projeções de fluxo de caixa.
          </p>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para visualizar projeções, cadastre pagamentos programados ou receitas futuras no sistema.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Atual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Receitas Programadas</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(
                  projections
                    .filter(p => p.type === 'income')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-slate-600">Pagamentos Programados</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(
                  projections
                    .filter(p => p.type === 'payment')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Saldo Atual</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(data.totalBalance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projeções Mensais */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Projeções Mensais</h4>
        
        <div className="space-y-4">
          {monthlyData.map((month, index) => {
            const balance = month.income - month.expenses;
            const isPositive = balance >= 0;
            
            return (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-slate-800">
                    {formatMonth(month.month)}
                  </h5>
                  <Badge 
                    className={
                      isPositive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {isPositive ? '+' : ''}{formatCurrency(balance)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Receitas Previstas</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(month.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Pagamentos Programados</p>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(month.expenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Saldo Projetado</p>
                    <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Alertas */}
      {monthlyData.some(month => (month.income - month.expenses) < 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Há meses com saldo negativo projetado. 
            Considere reprogramar pagamentos ou buscar receitas adicionais.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
