
import { Card } from "@/components/ui/card";

export const PaymentManager = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gerenciador de Pagamentos</h3>
        <p className="text-slate-600">
          Controle pagamentos a prestadores de serviço, incluindo pagamentos parciais, 
          antecipados e com atraso. Visualize o status de cada pagamento.
        </p>
      </Card>
    </div>
  );
};
