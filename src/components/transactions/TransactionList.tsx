
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Eye, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const TransactionList = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { fetchTransactions } = useSupabaseData();
  const { showError } = useToastFeedback();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      console.log('Carregando transações...');
      const data = await fetchTransactions();
      console.log('Transações carregadas:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      showError('Erro', 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryText = (category: string) => {
    const categories: { [key: string]: string } = {
      'service_payment': 'Pagamento de Serviço',
      'client_payment': 'Pagamento de Cliente',
      'fuel': 'Combustível',
      'accommodation': 'Hospedagem',
      'meals': 'Alimentação',
      'materials': 'Materiais',
      'maintenance': 'Manutenção',
      'office_expense': 'Despesa de Escritório',
      'other': 'Outros'
    };
    return categories[category] || category;
  };

  const getMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      'pix': 'PIX',
      'transfer': 'Transferência',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'cash': 'Dinheiro'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando transações...</span>
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma transação encontrada
          </h3>
          <p className="text-gray-500">
            As transações registradas aparecerão aqui
          </p>
          <Button 
            onClick={loadTransactions} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Transações ({transactions.length})
        </h3>
        <Button onClick={loadTransactions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-semibold text-lg ${getTypeColor(transaction.type)}`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                  <Badge className={getStatusBadgeColor(transaction.status)}>
                    {getStatusText(transaction.status)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p>Categoria: {getCategoryText(transaction.category)}</p>
                  <p>Método: {getMethodText(transaction.method)}</p>
                  <p>Data: {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p>Usuário: {transaction.user_name}</p>
                  
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {transaction.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {transaction.receipt && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(transaction.receipt, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Comprovante
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
