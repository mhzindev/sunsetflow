
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

export const CashFlowProjections = () => {
  const { getCashFlowProjections, data } = useFinancial();
  const projections = getCashFlowProjections();

  // Cálculos baseados em dados reais do sistema
  const calculateProjections = () => {
    const currentDate = new Date();
    const next7Days = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next30Days = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next60Days = new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000);
    const next90Days = new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Calcular receitas e despesas previstas com base nos dados reais
    const avgDailyIncome = data.monthlyIncome / 30;
    const avgDailyExpenses = data.monthlyExpenses / 30;

    // Pagamentos programados para os próximos períodos
    const upcomingPayments = data.payments.filter(p => 
      p.status === 'pending' || p.status === 'overdue'
    );

    const paymentsNext7Days = upcomingPayments.filter(p => 
      new Date(p.dueDate) <= next7Days
    ).reduce((sum, p) => sum + p.amount, 0);

    const paymentsNext30Days = upcomingPayments.filter(p => 
      new Date(p.dueDate) <= next30Days
    ).reduce((sum, p) => sum + p.amount, 0);

    const paymentsNext60Days = upcomingPayments.filter(p => 
      new Date(p.dueDate) <= next60Days
    ).reduce((sum, p) => sum + p.amount, 0);

    const paymentsNext90Days = upcomingPayments.filter(p => 
      new Date(p.dueDate) <= next90Days
    ).reduce((sum, p) => sum + p.amount, 0);

    return [
      {
        period: 'Próximos 7 dias',
        expectedIncome: avgDailyIncome * 7,
        expectedExpenses: (avgDailyExpenses * 7) + paymentsNext7Days,
        netFlow: (avgDailyIncome * 7) - ((avgDailyExpenses * 7) + paymentsNext7Days),
        status: (avgDailyIncome * 7) - ((avgDailyExpenses * 7) + paymentsNext7Days) > 0 ? 'positive' : 'negative'
      },
      {
        period: 'Próximos 30 dias',
        expectedIncome: data.monthlyIncome,
        expectedExpenses: data.monthlyExpenses + paymentsNext30Days,
        netFlow: data.monthlyIncome - (data.monthlyExpenses + paymentsNext30Days),
        status: data.monthlyIncome - (data.monthlyExpenses + paymentsNext30Days) > 0 ? 'positive' : 'negative'
      },
      {
        period: 'Próximos 60 dias',
        expectedIncome: data.monthlyIncome * 2,
        expectedExpenses: (data.monthlyExpenses * 2) + paymentsNext60Days,
        netFlow: (data.monthlyIncome * 2) - ((data.monthlyExpenses * 2) + paymentsNext60Days),
        status: (data.monthlyIncome * 2) - ((data.monthlyExpenses * 2) + paymentsNext60Days) > 0 ? 'positive' : 'warning'
      },
      {
        period: 'Próximos 90 dias',
        expectedIncome: data.monthlyIncome * 3,
        expectedExpenses: (data.monthlyExpenses * 3) + paymentsNext90Days,
        netFlow: (data.monthlyIncome * 3) - ((data.monthlyExpenses * 3) + paymentsNext90Days),
        status: (data.monthlyIncome * 3) - ((data.monthlyExpenses * 3) + paymentsNext90Days) > 5000 ? 'positive' : 'warning'
      }
    ];
  };

  const realProjections = calculateProjections();

  // Recebimentos previstos baseados em transações pendentes
  const getUpcomingReceivables = () => {
    const pendingIncomeTransactions = data.transactions.filter(t => 
      t.type === 'income' && t.status === 'pending'
    );

    return pendingIncomeTransactions.map(t => ({
      client: t.description,
      amount: t.amount,
      expectedDate: t.date,
      probability: 85 // Base de confiança padrão
    }));
  };

  const upcomingReceivables = getUpcomingReceivables();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800 border-green-200',
      negative: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status as keyof typeof colors] || colors.warning;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 90) return 'bg-green-100 text-green-800';
    if (probability >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getProjectionTooltip = (period: string) => {
    const tooltips = {
      'Próximos 7 dias': 'Projeção baseada em pagamentos programados e despesas previstas para a próxima semana. Fundamental para gestão de caixa imediata.',
      'Próximos 30 dias': 'Projeção mensal considerando contratos em andamento e despesas operacionais. Essencial para planejamento de médio prazo.',
      'Próximos 60 dias': 'Projeção bimestral incluindo novos projetos esperados e investimentos planejados. Importante para decisões estratégicas.',
      'Próximos 90 dias': 'Projeção trimestral considerando sazonalidade e expansão do negócio. Crítica para planejamento financeiro de longo prazo.'
    };
    return tooltips[period as keyof typeof tooltips] || 'Projeção de fluxo de caixa baseada em dados históricos e contratos firmados.';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Projeções por Período */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {realProjections.map((projection, index) => (
            <Card key={index} className={`p-4 border-2 ${getStatusColor(projection.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-slate-800">{projection.period}</h5>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      {getStatusIcon(projection.status)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{getProjectionTooltip(projection.period)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Entradas:</span>
                  <span className="font-medium text-green-700">
                    R$ {projection.expectedIncome.toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Saídas:</span>
                  <span className="font-medium text-red-700">
                    R$ {projection.expectedExpenses.toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <hr />
                
                <div className="flex justify-between">
                  <span className="font-medium">Saldo:</span>
                  <span className={`font-bold ${
                    projection.netFlow >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    R$ {projection.netFlow.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumo Atual do Sistema */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-blue-800">Situação Atual do Sistema</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="w-5 h-5 text-blue-600 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm">Resumo em tempo real da situação financeira da empresa baseado em todas as transações, pagamentos e despesas registradas no sistema.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-blue-600">Transações Registradas</p>
              <p className="text-2xl font-bold text-blue-800">{data.transactions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600">Saldo Total</p>
              <p className="text-2xl font-bold text-blue-800">
                R$ {data.totalBalance.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600">Pagamentos Pendentes</p>
              <p className="text-2xl font-bold text-blue-800">
                R$ {data.pendingPayments.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-600">Despesas Aprovadas</p>
              <p className="text-2xl font-bold text-blue-800">
                R$ {data.approvedExpenses.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        {/* Recebimentos Previstos */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Recebimentos Previstos</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrendingUp className="w-5 h-5 text-slate-600 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm">Lista de recebimentos esperados baseada em transações pendentes registradas no sistema.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {upcomingReceivables.length > 0 ? (
            <div className="space-y-3">
              {upcomingReceivables.map((receivable, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-slate-800">{receivable.client}</h5>
                    <p className="text-sm text-slate-600">
                      Previsão: {new Date(receivable.expectedDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getProbabilityColor(receivable.probability)}>
                      {receivable.probability}% confiança
                    </Badge>
                    <span className="font-semibold text-slate-800">
                      R$ {receivable.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-800">Total Previsto:</span>
                  <span className="text-xl font-bold text-blue-900">
                    R$ {upcomingReceivables.reduce((sum, r) => sum + r.amount, 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Nenhum recebimento pendente encontrado.</p>
              <p className="text-sm text-slate-500 mt-2">
                Transações de entrada com status pendente aparecerão aqui.
              </p>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};
