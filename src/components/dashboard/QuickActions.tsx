
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { file-plus as FilePlus, receipt as Receipt, trending-up as TrendingUp } from "lucide-react";

export const QuickActions = () => {
  const actions = [
    {
      title: "Nova Transação",
      description: "Registrar entrada ou saída",
      icon: FilePlus,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Novo Pagamento",
      description: "Pagar prestador de serviço",
      icon: Receipt,
      color: "bg-emerald-600 hover:bg-emerald-700"
    },
    {
      title: "Projeção de Fluxo",
      description: "Ver previsões de caixa",
      icon: TrendingUp,
      color: "bg-purple-600 hover:bg-purple-700"
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
