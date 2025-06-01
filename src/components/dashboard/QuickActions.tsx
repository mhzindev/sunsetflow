
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FilePlus, Receipt, TrendingUp } from "lucide-react";

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      title: "Nova Transação",
      description: "Registrar entrada ou saída",
      icon: FilePlus,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => onNavigate('transactions'),
      tooltip: "Registre receitas recebidas via PIX, transferências, cartões ou outras formas de pagamento. Também permite registrar saídas diversas e movimentações financeiras gerais da empresa."
    },
    {
      title: "Novo Pagamento",
      description: "Pagar prestador de serviço",
      icon: Receipt,
      color: "bg-emerald-600 hover:bg-emerald-700",
      onClick: () => onNavigate('payments'),
      tooltip: "Gerencie pagamentos a prestadores de serviços externos. Controle prazos, valores, status de pagamento e histórico de relacionamento com fornecedores e parceiros."
    },
    {
      title: "Projeção de Fluxo",
      description: "Ver previsões de caixa",
      icon: TrendingUp,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => onNavigate('cashflow'),
      tooltip: "Visualize projeções futuras do fluxo de caixa considerando recebimentos esperados, pagamentos programados e tendências históricas. Fundamental para planejamento financeiro."
    }
  ];

  return (
    <TooltipProvider>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
        
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-2 hover:border-slate-300"
                    onClick={action.onClick}
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800">{action.title}</p>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="text-sm">{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </Card>
    </TooltipProvider>
  );
};
