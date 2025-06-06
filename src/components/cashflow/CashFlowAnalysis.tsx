
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useCashFlowAnalysis } from '@/hooks/useCashFlowAnalysis';

export const CashFlowAnalysis = () => {
  const { healthIndicators, riskAnalysis, opportunities, loading } = useCashFlowAnalysis();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">Carregando análise financeira...</div>
        </Card>
      </div>
    );
  }

  const generateSummary = () => {
    const dangerIndicators = healthIndicators.filter(i => i.status === 'danger').length;
    const warningIndicators = healthIndicators.filter(i => i.status === 'warning').length;
    const highRisks = riskAnalysis.filter(r => r.level === 'high').length;
    
    if (dangerIndicators > 0 || highRisks > 0) {
      return `Atenção necessária: ${dangerIndicators + highRisks} indicador(es) crítico(s) identificado(s). Ação imediata recomendada.`;
    } else if (warningIndicators > 0) {
      return `Situação estável com ${warningIndicators} ponto(s) de atenção. Monitore os indicadores em amarelo.`;
    } else {
      return `Excelente saúde financeira! Todos os indicadores estão dentro dos parâmetros ideais.`;
    }
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
                <p className="text-sm">Métricas essenciais calculadas com base nos dados reais da empresa para avaliar a solidez financeira atual.</p>
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
                <p className="text-sm">Riscos identificados automaticamente com base nos dados financeiros reais da empresa.</p>
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
                <p className="text-sm">Oportunidades calculadas automaticamente com base na situação financeira atual da empresa.</p>
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
              <strong>Resumo:</strong> {generateSummary()}
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    </TooltipProvider>
  );
};
