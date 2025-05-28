
import { Card } from "@/components/ui/card";

export const TransactionManager = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gerenciador de Transações</h3>
        <p className="text-slate-600">
          Aqui você poderá visualizar e gerenciar todas as transações da empresa, 
          incluindo entradas via PIX, cartões de crédito e outras formas de pagamento.
        </p>
      </Card>
    </div>
  );
};
