import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { useFinancialSimplified } from "@/contexts/FinancialContextSimplified";
import { useTransactionSync } from "@/hooks/useTransactionSync";
import { useState } from "react";

interface RecentTransactionsProps {
  onViewAll?: () => void;
}

export const RecentTransactions = ({ onViewAll }: RecentTransactionsProps) => {
  const { getRecentTransactions, loading, error } = useFinancialSimplified();
  const { syncTransactions, isRetrying, retryCount } = useTransactionSync();
  const [refreshing, setRefreshing] = useState(false);
  const recentTransactions = getRecentTransactions(4);

  const handleViewAll = () => {
    onViewAll?.();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const result = await syncTransactions();
      if (!result.success) {
        console.error('Falha na sincronização:', result.error);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações:', error);
    } finally {
      setRefreshing(false);
    }
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

  const formatAmount = (amount: number | undefined) => {
    return (amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  if (error && !loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Transações Recentes</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isRetrying}
            className="text-red-600 hover:text-red-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRetrying) ? 'animate-spin' : ''}`} />
            {isRetrying ? `Tentando (${retryCount}/3)` : 'Tentar novamente'}
          </Button>
        </div>
        
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Transações Recentes</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isRetrying || loading}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(refreshing || isRetrying || loading) ? 'animate-spin' : ''}`} />
            {isRetrying ? `Sync (${retryCount}/3)` : 'Sync'}
          </Button>
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
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-slate-600 mt-2">Carregando...</p>
          </div>
        ) : recentTransactions.length > 0 ? (
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
                  <p className="font-medium text-slate-800">{transaction.description || 'Sem descrição'}</p>
                  <p className="text-sm text-slate-600">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString('pt-BR') : 'Data não informada'} • {transaction.userName || 'Usuário'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}R$ {formatAmount(transaction.amount)}
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
