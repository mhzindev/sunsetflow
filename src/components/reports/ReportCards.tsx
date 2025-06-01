
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  Users, 
  Plane, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useReportGenerator } from '@/hooks/useReportGenerator';

interface ReportCardsProps {
  onDateRangeChange: (start: string, end: string) => void;
}

export const ReportCards = ({ onDateRangeChange }: ReportCardsProps) => {
  const { generateReport } = useReportGenerator();

  const reports = [
    {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Visão geral das finanças',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tooltip: 'Relatório completo das receitas, despesas e saldo da empresa em um período específico. Inclui análise de lucro/prejuízo e comparativos mensais.'
    },
    {
      id: 'cashflow',
      title: 'Fluxo de Caixa',
      description: 'Análise de entradas e saídas',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      tooltip: 'Acompanhamento detalhado do movimento de caixa, mostrando todas as entradas e saídas de dinheiro organizadas por data e categoria.'
    },
    {
      id: 'taxes',
      title: 'Relatório Fiscal',
      description: 'Dados para declarações',
      icon: Calculator,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      tooltip: 'Informações organizadas para facilitar a prestação de contas fiscais, incluindo receitas tributáveis e despesas dedutíveis.'
    },
    {
      id: 'payments',
      title: 'Relatório de Pagamentos',
      description: 'Pagamentos a prestadores',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      tooltip: 'Controle completo dos pagamentos realizados ou pendentes para prestadores de serviços, com status e datas de vencimento.'
    },
    {
      id: 'providers',
      title: 'Relatório de Prestadores',
      description: 'Análise por prestador',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      tooltip: 'Análise detalhada do desempenho e valores pagos a cada prestador de serviços, facilitando a gestão de parcerias.'
    },
    {
      id: 'travel-expenses',
      title: 'Despesas de Viagem',
      description: 'Gastos em missões',
      icon: Plane,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      tooltip: 'Relatório específico de todas as despesas relacionadas a viagens e missões dos funcionários, organizadas por funcionário e missão.'
    },
    {
      id: 'reimbursements',
      title: 'Relatório de Reembolsos',
      description: 'Controle de reembolsos',
      icon: RefreshCw,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      tooltip: 'Acompanhamento de todos os reembolsos solicitados, aprovados e pagos aos funcionários, com histórico completo de cada processo.'
    }
  ];

  const handleGenerateReport = (reportType: string) => {
    // Usar período padrão dos últimos 30 dias
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    onDateRangeChange(startStr, endStr);
    generateReport(reportType, { start: startStr, end: endStr });
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className={`p-6 hover:shadow-lg transition-shadow ${report.bgColor} border-l-4 border-l-current`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`p-2 rounded-lg ${report.bgColor} ${report.color} cursor-help`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3">
                      <div className="space-y-2">
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm">{report.tooltip}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className={`font-semibold ${report.color} cursor-help flex items-center gap-1`}>
                          {report.title}
                          <HelpCircle className="w-3 h-3 opacity-60" />
                        </h3>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3">
                        <div className="space-y-2">
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm">{report.tooltip}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => handleGenerateReport(report.id)}
                className={`w-full ${report.color} bg-white border hover:${report.bgColor}`}
                variant="outline"
              >
                Gerar Relatório
              </Button>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
