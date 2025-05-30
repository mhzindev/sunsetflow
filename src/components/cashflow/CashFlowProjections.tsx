
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

export const CashFlowProjections = () => {
  const { getCashFlowProjections, data } = useFinancial();
  const projections = getCashFlowProjections();

  // Extender as projeções com dados calculados
  const extendedProjections = [
    ...projections,
    {
      period: 'Próximos 60 dias',
      expectedIncome: data.pendingPayments * 1.3,
      expectedExpenses: 78000.00,
      netFlow: (data.pendingPayments * 1.3) - 78000.00,
      status: (data.pendingPayments * 1.3) - 78000.00 > 0 ? 'positive' : 'negative'
    },
    {
      period: 'Próximos 90 dias',
      expectedIncome: data.pendingPayments * 1.8,
      expectedExpenses: 118000.00,
      netFlow: (data.pendingPayments * 1.8) - 118000.00,
      status: (data.pendingPayments * 1.8) - 118000.00 > 5000 ? 'positive' : 'warning'
    }
  ];

  const upcomingReceivables = [
    {
      client: 'Cliente ABC - Projeto Alpha',
      amount: 15000.00,
      expectedDate: '2024-02-05',
      probability: 90
    },
    {
      client: 'Cliente XYZ - Instalação Premium',
      amount: 8500.00,
      expectedDate: '2024-02-12',
      probability: 85
    },
    {
      client: 'Cliente DEF - Manutenção Anual',
      amount: 6200.00,
      expectedDate: '2024-02-18',
      probability: 95
    },
    {
      client: 'Cliente GHI - Novos Rastreadores',
      amount: 12000.00,
      expectedDate: '2024-02-25',
      probability: 75
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Projeções por Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {extendedProjections.map((projection, index) => (
          <Card key={index} className={`p-4 border-2 ${getStatusColor(projection.status)}`}>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-slate-800">{projection.period}</h5>
              {getStatusIcon(projection.status)}
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
        <h4 className="text-lg font-semibold text-blue-800 mb-4">Situação Atual do Sistema</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </Card>

      {/* Recebimentos Previstos */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Recebimentos Previstos</h4>
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
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-800">Total Previsto (60 dias):</span>
            <span className="text-xl font-bold text-blue-900">
              R$ {upcomingReceivables.reduce((sum, r) => sum + r.amount, 0).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
