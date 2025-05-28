
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const RecentTransactions = () => {
  const transactions = [
    {
      id: 1,
      description: "Pagamento Prestador - João Silva",
      amount: -2500.00,
      type: "Pagamento",
      method: "PIX",
      date: "2024-01-15",
      status: "Concluído"
    },
    {
      id: 2,
      description: "Recebimento Cliente - Projeto Alpha",
      amount: 8500.00,
      type: "Recebimento",
      method: "Transferência",
      date: "2024-01-14",
      status: "Concluído"
    },
    {
      id: 3,
      description: "Compra Material - Cartão Corporativo",
      amount: -850.00,
      type: "Despesa",
      method: "Cartão",
      date: "2024-01-13",
      status: "Processando"
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Transações Recentes</h3>
        <Button variant="outline" size="sm">Ver Todas</Button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-slate-800">{transaction.description}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-slate-600">{transaction.date}</span>
                <span className="text-sm text-slate-600">{transaction.method}</span>
                <Badge variant={transaction.status === 'Concluído' ? 'default' : 'secondary'}>
                  {transaction.status}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-bold ${
                transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2 
                })}
              </p>
              <p className="text-sm text-slate-600">{transaction.type}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
