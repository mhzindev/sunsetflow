
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export const CashFlowProjections = () => {
  const projections = [
    {
      period: 'Próximos 7 dias',
      expectedIncome: 12500.00,
      expectedExpenses: 8300.00,
      netFlow: 4200.00,
      status: 'positive'
    },
    {
      period: 'Próximos 30 dias',
      expectedIncome: 45000.00,
      expectedExpenses: 38500.00,
      netFlow: 6500.00,
      status: 'positive'
    },
    {
      period: 'Próximos 60 dias',
      expectedIncome: 89000.00,
      expectedExpenses: 78000.00,
      netFlow: 11000.00,
      status: 'positive'
    },
    {
      period: 'Próximos 90 dias',
      expectedIncome: 125000.00,
      expectedExpenses: 118000.00,
      netFlow: 7000.00,
      status: 'warning'
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
        {projections.map((projection, index) => (
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
