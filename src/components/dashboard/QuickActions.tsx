
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      onClick: () => onNavigate('transactions')
    },
    {
      title: "Novo Pagamento",
      description: "Pagar prestador de serviço",
      icon: Receipt,
      color: "bg-emerald-600 hover:bg-emerald-700",
      onClick: () => onNavigate('payments')
    },
    {
      title: "Projeção de Fluxo",
      description: "Ver previsões de caixa",
      icon: TrendingUp,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => onNavigate('cashflow')
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
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
          );
        })}
      </div>
    </Card>
  );
};
