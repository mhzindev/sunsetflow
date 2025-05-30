
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const CashFlowAnalysis = () => {
  const healthIndicators = [
    {
      metric: 'Liquidez Corrente',
      value: '2.4',
      status: 'good',
      description: 'Capacidade de pagamento a curto prazo',
      benchmark: 'Ideal: > 2.0'
    },
    {
      metric: 'Dias de Caixa',
      value: '45',
      status: 'warning',
      description: 'Dias de operação com o caixa atual',
      benchmark: 'Ideal: > 60 dias'
    },
    {
      metric: 'Margem de Segurança',
      value: '18%',
      status: 'good',
      description: 'Reserva em relação às despesas mensais',
      benchmark: 'Ideal: > 15%'
    },
    {
      metric: 'Precisão das Projeções',
      value: '87%',
      status: 'good',
      description: 'Acurácia das previsões dos últimos 3 meses',
      benchmark: 'Ideal: > 80%'
    }
  ];

  const riskAnalysis = [
    {
      risk: 'Concentração de Recebimentos',
      level: 'medium',
      impact: 'Médio',
      description: '65% dos recebimentos vêm de 3 clientes principais',
      recommendation: 'Diversificar base de clientes'
    },
    {
      risk: 'Sazonalidade',
      level: 'low',
      impact: 'Baixo',
      description: 'Variação de 15% entre meses de alta e baixa',
      recommendation: 'Manter reserva para períodos sazonais'
    },
    {
      risk: 'Inadimplência',
      level: 'low',
      impact: 'Baixo',
      description: 'Taxa histórica de 2.1% nos últimos 12 meses',
      recommendation: 'Manter política atual de cobrança'
    }
  ];

  const opportunities = [
    {
      opportunity: 'Antecipação de Recebíveis',
      potential: 'R$ 25.000',
      description: 'Negociar desconto para pagamento antecipado',
      timeframe: '30 dias'
    },
    {
      opportunity: 'Renegociação de Prazos',
      potential: 'R$ 8.500',
      description: 'Estender prazos de pagamento com fornecedores',
      timeframe: '15 dias'
    },
    {
      opportunity: 'Investimento de Sobras',
      potential: 'R$ 1.200/mês',
      description: 'Aplicar excedente de caixa em CDB/Tesouro',
      timeframe: 'Imediato'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'danger':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      good: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      danger: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.warning;
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Indicadores de Saúde Financeira */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Indicadores de Saúde Financeira</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthIndicators.map((indicator, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(indicator.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">{indicator.metric}</h5>
                {getStatusIcon(indicator.status)}
              </div>
              <div className="text-2xl font-bold mb-1">{indicator.value}</div>
              <p className="text-sm mb-2">{indicator.description}</p>
              <p className="text-xs opacity-75">{indicator.benchmark}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Análise de Riscos */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Análise de Riscos</h4>
        <div className="space-y-4">
          {riskAnalysis.map((risk, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">{risk.risk}</h5>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(risk.level)}>
                    {risk.level === 'low' ? 'Baixo' : risk.level === 'medium' ? 'Médio' : 'Alto'}
                  </Badge>
                  <span className="text-sm text-slate-600">Impacto: {risk.impact}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{risk.description}</p>
              <p className="text-sm font-medium text-blue-700">💡 {risk.recommendation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Oportunidades de Melhoria */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Oportunidades de Melhoria</h4>
        <div className="space-y-4">
          {opportunities.map((opp, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-slate-800">{opp.opportunity}</h5>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {opp.potential}
                  </Badge>
                  <span className="text-sm text-slate-600">{opp.timeframe}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600">{opp.description}</p>
            </div>
          ))}
        </div>

        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Resumo:</strong> O fluxo de caixa está saudável com potencial de melhoria de 
            R$ 34.700 através das oportunidades identificadas. Recomenda-se foco na diversificação 
            de clientes e otimização dos prazos de pagamento.
          </AlertDescription>
        </Alert>
      </Card>
    </div>
  );
};
