
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";

interface RecentTransactionsProps {
  onViewAll?: () => void;
}

export const RecentTransactions = ({ onViewAll }: RecentTransactionsProps) => {
  const { getRecentTransactions } = useFinancial();
  const recentTransactions = getRecentTransactions(4);

  const handleViewAll = () => {
    onViewAll?.();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      client_payment: 'bg-green-100 text-green-800',
      fuel: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-blue-100 text-blue-800',
      meals: 'bg-emerald-100 text-emerald-800',
      materials: 'bg-yellow-100 text-yellow-800',
      service_payment: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-indigo-100 text-indigo-800',
      office_expense: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      client_payment: 'Cliente',
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      service_payment: 'Serviços',
      maintenance: 'Manutenção',
      office_expense: 'Escritório',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || 'Outros';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Transações Recentes</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleViewAll}
          className="text-blue-600 hover:text-blue-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Todas
        </Button>
      </div>
      
      <div className="space-y-3">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{transaction.description}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')} • {transaction.userName}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <Badge variant="outline" className={getCategoryColor(transaction.category)}>
                  {getCategoryLabel(transaction.category)}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma transação registrada ainda</p>
            <p className="text-sm mt-1">Comece registrando sua primeira transação</p>
          </div>
        )}
      </div>
    </Card>
  );
};
