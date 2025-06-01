
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, Download } from "lucide-react";

export const AccountTransactions = () => {
  // Dados mockados para demonstração
  const mockTransactions = [
    {
      id: '1',
      date: '2024-02-01',
      description: 'Recebimento Cliente ABC',
      type: 'income',
      amount: 15000.00,
      account: 'Conta Corrente Empresa',
      category: 'Vendas'
    },
    {
      id: '2',
      date: '2024-01-30',
      description: 'Pagamento Fornecedor XYZ',
      type: 'expense',
      amount: -5000.00,
      account: 'Cartão Empresarial',
      category: 'Materiais'
    },
    {
      id: '3',
      date: '2024-01-28',
      description: 'Transferência entre contas',
      type: 'transfer',
      amount: 10000.00,
      account: 'Conta Poupança → Conta Corrente',
      category: 'Transferência'
    }
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      income: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
      transfer: 'bg-blue-100 text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      income: 'Entrada',
      expense: 'Saída',
      transfer: 'Transferência'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-slate-800">
              Movimentações das Contas
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Ordenar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getTypeColor(transaction.type)}>
                        {getTypeLabel(transaction.type)}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-slate-800 mb-1">
                      {transaction.description}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Conta: {transaction.account}</span>
                      <span>Categoria: {transaction.category}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {mockTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-2">Nenhuma movimentação encontrada</p>
              <p className="text-sm text-slate-500">
                As movimentações das suas contas aparecerão aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
