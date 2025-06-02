
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionListProps {
  transactions: any[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TransactionList = ({ transactions, onView, onEdit, onDelete }: TransactionListProps) => {
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

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma transação encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            As transações registradas aparecerão aqui. Experimente registrar uma nova transação.
          </p>
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
                  <p>Método: {getMethodText(transaction.method || transaction.paymentMethod)}</p>
                  <p>Data: {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  {transaction.employeeName && (
                    <p>Usuário: {transaction.employeeName}</p>
                  )}
                  
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
                
                {onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(transaction.id)}
                  >
                    Ver
                  </Button>
                )}
                
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(transaction.id)}
                  >
                    Editar
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(transaction.id)}
                  >
                    Excluir
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
