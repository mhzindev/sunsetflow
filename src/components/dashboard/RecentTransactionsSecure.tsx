import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransactionsSecure } from "@/hooks/useTransactionsSecure";
import { formatCurrency } from "@/utils/dateUtils";
import { ArrowUpCircle, ArrowDownCircle, Eye, Shield } from "lucide-react";

interface RecentTransactionsProps {
  onViewAll: () => void;
}

export const RecentTransactionsSecure = ({ onViewAll }: RecentTransactionsProps) => {
  const { transactions, loading } = useTransactionsSecure();

  // Pegar apenas as 5 transações mais recentes
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? 
      <ArrowUpCircle className="h-4 w-4 text-green-600" /> : 
      <ArrowDownCircle className="h-4 w-4 text-red-600" />;
  };

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Concluída',
      pending: 'Pendente',
      cancelled: 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Transações Recentes
            <Shield className="h-4 w-4 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando transações isoladas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Transações Recentes
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-normal text-muted-foreground">
              ({recentTransactions.length} da empresa)
            </span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onViewAll}>
            <Eye className="w-4 h-4 mr-2" />
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma transação encontrada para esta empresa</p>
            <p className="text-sm mt-1">As transações são isoladas por empresa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                      <Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {getStatusLabel(transaction.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(transaction.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.user_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
