import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export const CashFlowAnalysis = () => {
  const healthIndicators = [
    {
      metric: 'Liquidez Corrente',
      value: '2.4',
      status: 'good',
      description: 'Capacidade de pagamento a curto prazo',
      benchmark: 'Ideal: > 2.0',
      tooltip: 'Indica quantas vezes a empresa consegue pagar suas dívidas de curto prazo com os recursos disponíveis. Valor acima de 2.0 demonstra boa saúde financeira.'
    },
    {
      metric: 'Dias de Caixa',
      value: '45',
      status: 'warning',
      description: 'Dias de operação com o caixa atual',
      benchmark: 'Ideal: > 60 dias',
      tooltip: 'Mostra quantos dias a empresa consegue operar com o dinheiro em caixa. É crucial manter pelo menos 60 dias para cobrir imprevistos e sazonalidade.'
    },
    {
      metric: 'Margem de Segurança',
      value: '18%',
      status: 'good',
      description: 'Reserva em relação às despesas mensais',
      benchmark: 'Ideal: > 15%',
      tooltip: 'Percentual do faturamento mantido como reserva de segurança. Uma margem saudável protege contra variações no mercado e emergências.'
    },
    {
      metric: 'Precisão das Projeções',
      value: '87%',
      status: 'good',
      description: 'Acurácia das previsões dos últimos 3 meses',
      benchmark: 'Ideal: > 80%',
      tooltip: 'Mede a qualidade das projeções financeiras comparando valores projetados com realizados. Alta precisão indica bom controle e planejamento.'
    }
  ];

  const riskAnalysis = [
    {
      risk: 'Concentração de Recebimentos',
      level: 'medium',
      impact: 'Médio',
      description: '65% dos recebimentos vêm de 3 clientes principais',
      recommendation: 'Diversificar base de clientes',
      tooltip: 'Dependência excessiva de poucos clientes pode comprometer o fluxo de caixa se algum atrasar pagamentos ou cancelar contratos.'
    },
    {
      risk: 'Sazonalidade',
      level: 'low',
      impact: 'Baixo',
      description: 'Variação de 15% entre meses de alta e baixa',
      recommendation: 'Manter reserva para períodos sazonais',
      tooltip: 'Variações sazonais naturais do negócio que devem ser consideradas no planejamento financeiro para evitar problemas de caixa.'
    },
    {
      risk: 'Inadimplência',
      level: 'low',
      impact: 'Baixo',
      description: 'Taxa histórica de 2.1% nos últimos 12 meses',
      recommendation: 'Manter política atual de cobrança',
      tooltip: 'Percentual de clientes que não pagam dentro do prazo. Taxa baixa indica boa qualidade da carteira de clientes.'
    }
  ];

  const opportunities = [
    {
      opportunity: 'Antecipação de Recebíveis',
      potential: 'R$ 25.000',
      description: 'Negociar desconto para pagamento antecipado',
      timeframe: '30 dias',
      tooltip: 'Oferecer desconto aos clientes em troca de pagamento antecipado melhora o fluxo de caixa e reduz inadimplência.'
    },
    {
      opportunity: 'Renegociação de Prazos',
      potential: 'R$ 8.500',
      description: 'Estender prazos de pagamento com fornecedores',
      timeframe: '15 dias',
      tooltip: 'Negociar prazos maiores com fornecedores sem impacto nos custos libera capital de giro para outras necessidades.'
    },
    {
      opportunity: 'Investimento de Sobras',
      potential: 'R$ 1.200/mês',
      description: 'Aplicar excedente de caixa em CDB/Tesouro',
      timeframe: 'Imediato',
      tooltip: 'Aplicar recursos excedentes em investimentos seguros gera receita adicional sem comprometer a liquidez operacional.'
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
    <TooltipProvider>
      <div className="space-y-6">
        {/* Indicadores de Saúde Financeira */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Indicadores de Saúde Financeira</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-5 h-5 text-slate-500 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm">Métricas essenciais que avaliam a solidez financeira da empresa e sua capacidade de honrar compromissos e crescer de forma sustentável.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthIndicators.map((indicator, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(indicator.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{indicator.metric}</h5>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(indicator.status)}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">{indicator.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
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
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Análise de Riscos</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="w-5 h-5 text-slate-500 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm">Identificação e avaliação dos principais riscos que podem impactar o fluxo de caixa da empresa, com recomendações para mitigação.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">{risk.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
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
          <div className="flex items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Oportunidades de Melhoria</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrendingUp className="w-5 h-5 text-slate-500 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm">Oportunidades identificadas para otimizar o fluxo de caixa e aumentar a rentabilidade através de ações estratégicas de curto e médio prazo.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">{opp.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
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
    </TooltipProvider>
  );
};
