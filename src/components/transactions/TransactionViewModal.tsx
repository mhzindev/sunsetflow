
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, FileText, Tag, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/dateUtils';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  employeeName: string;
  receipt?: string;
  tags?: string[];
  method: string;
}

interface TransactionViewModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionViewModal = ({ transaction, isOpen, onClose }: TransactionViewModalProps) => {
  if (!transaction) return null;

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      income: { label: 'Receita', className: 'bg-green-100 text-green-800' },
      expense: { label: 'Despesa', className: 'bg-red-100 text-red-800' }
    };
    
    const typeConfig = config[type as keyof typeof config];
    return <Badge className={typeConfig.className}>{typeConfig.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      service_payment: 'Pagamento de Serviços',
      client_payment: 'Recebimento de Cliente',
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      maintenance: 'Manutenção',
      office_expense: 'Despesa de Escritório',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      pix: 'PIX',
      transfer: 'Transferência',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detalhes da Transação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com tipo e status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeBadge(transaction.type)}
              {getStatusBadge(transaction.status)}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Valor</p>
              <p className={`text-2xl font-bold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Descrição</p>
                  <p className="font-medium">{transaction.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Categoria</p>
                  <p className="font-medium">{getCategoryLabel(transaction.category)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Responsável</p>
                  <p className="font-medium">{transaction.employeeName}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium">{formatDate(transaction.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Forma de Pagamento</p>
                  <p className="font-medium">{getMethodLabel(transaction.method)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">ID da Transação</p>
                  <p className="font-mono text-sm text-gray-500">{transaction.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comprovante */}
          {transaction.receipt && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Comprovante</p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <a 
                  href={transaction.receipt} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ver comprovante
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
