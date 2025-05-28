
import { Card } from "@/components/ui/card";

export const CashFlow = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Fluxo de Caixa</h3>
        <p className="text-slate-600">
          Visualize projeções de fluxo de caixa, considerando recebimentos previstos 
          entre 30-45 dias e pagamentos programados.
        </p>
      </Card>
    </div>
  );
};
