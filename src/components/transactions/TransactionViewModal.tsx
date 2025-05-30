
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, CreditCard, FileText, Tag, Receipt } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface TransactionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionViewModal = ({ 
  isOpen, 
  onClose, 
  transaction,
  onEdit 
}: TransactionViewModalProps) => {
  if (!transaction) return null;

  const getCategoryLabel = (category: string) => {
    const labels = {
      service_payment: 'Pagamento Serviços',
      client_payment: 'Recebimento Cliente',
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      maintenance: 'Manutenção',
      office_expense: 'Despesa Escritório',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
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
          {/* Status and Type */}
          <div className="flex justify-between items-start">
            <div>
              <Badge className={getStatusColor(transaction.status)}>
                {getStatusLabel(transaction.status)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tipo</p>
              <p className={`text-lg font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? 'Entrada' : 'Saída'}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Valor</p>
            <p className={`text-3xl font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <Badge variant="outline">
                    {getCategoryLabel(transaction.category)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Usuário</p>
                  <p className="font-medium">{transaction.userName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Método de Pagamento</p>
                  <p className="font-medium">{getMethodLabel(transaction.method)}</p>
                </div>
              </div>

              {transaction.missionId && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">ID da Missão</p>
                    <p className="font-medium">{transaction.missionId}</p>
                  </div>
                </div>
              )}

              {transaction.receipt && (
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Comprovante</p>
                    <Button variant="outline" size="sm">
                      Ver Arquivo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Descrição</p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{transaction.description}</p>
            </div>
          </div>

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            {onEdit && transaction.status !== 'completed' && (
              <Button 
                onClick={() => onEdit(transaction)}
                className="flex-1"
              >
                Editar Transação
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
