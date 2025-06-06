
import { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Eye, Edit, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Payment } from '@/types/payment';
import { PaymentViewModal } from './PaymentViewModal';
import { PaymentEditModal } from './PaymentEditModal';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

interface PaymentTableRowProps {
  payment: Payment;
}

export const PaymentTableRow = ({ payment }: PaymentTableRowProps) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToastFeedback();
  const { updatePaymentStatus } = useFinancial();

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      partial: 'Parcial',
      completed: 'Concluído',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      full: 'Integral',
      installment: 'Parcelado',
      advance: 'Adiantamento',
      partial: 'Parcial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getUrgencyBadge = () => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && payment.status !== 'completed') {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {Math.abs(diffDays)} dia{Math.abs(diffDays) > 1 ? 's' : ''} em atraso
        </Badge>
      );
    } else if (diffDays <= 3 && diffDays >= 0 && payment.status !== 'completed') {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Vence em {diffDays} dia{diffDays > 1 ? 's' : ''}
        </Badge>
      );
    }
    return null;
  };

  // Verificar se pagamento tem problemas de vinculação
  const hasProviderIssue = !payment.providerId && payment.providerName;

  const handleSavePayment = (updatedPayment: Payment) => {
    console.log('Payment updated via modal:', updatedPayment);
    showSuccess('Sucesso', 'Pagamento atualizado com sucesso!');
  };

  const handleMarkAsPaid = async (payment: Payment) => {
    if (isProcessing) return;
    
    console.log('PaymentTableRow: Processando pagamento:', payment.id);
    
    // Verificar se há problemas antes de processar
    if (!payment.providerId && payment.providerName) {
      showError(
        'Erro de Vinculação', 
        `Este pagamento não está vinculado a um prestador válido. Entre em contato com o administrador para corrigir a vinculação do prestador "${payment.providerName}".`
      );
      return;
    }
    
    try {
      setIsProcessing(true);
      
      console.log('PaymentTableRow: Atualizando status no banco via FinancialContext...');
      const success = await updatePaymentStatus(payment.id, 'completed');
      
      if (success) {
        console.log('PaymentTableRow: Status atualizado com sucesso no banco');
        showSuccess(
          'Pagamento Confirmado', 
          `Pagamento de R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ${payment.providerName} foi processado e salvo no banco de dados!`
        );
      } else {
        console.error('PaymentTableRow: Falha ao atualizar status no banco');
        showError('Erro', 'Falha ao salvar o pagamento no banco de dados. Tente novamente.');
      }
      
    } catch (error) {
      console.error('PaymentTableRow: Erro inesperado ao processar pagamento:', error);
      showError('Erro', 'Erro inesperado ao processar pagamento. Verifique sua conexão e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditFromView = (payment: Payment) => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setIsEditModalOpen(true);
    }, 100);
  };

  return (
    <>
      <TableRow className={hasProviderIssue ? "bg-orange-50" : ""}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {payment.providerName}
            {hasProviderIssue && (
              <div title="Prestador não vinculado corretamente">
                <AlertCircle className="w-4 h-4 text-orange-500" />
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>{payment.description}</TableCell>
        <TableCell>{getTypeLabel(payment.type)}</TableCell>
        <TableCell className="font-semibold">
          R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </TableCell>
        <TableCell>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</TableCell>
        <TableCell>
          <Badge className={getStatusColor(payment.status)}>
            {getStatusLabel(payment.status)}
          </Badge>
        </TableCell>
        <TableCell>{getUrgencyBadge()}</TableCell>
        <TableCell>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsViewModalOpen(true)}
              title="Visualizar detalhes"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              title="Editar pagamento"
            >
              <Edit className="w-4 h-4" />
            </Button>
            {payment.status !== 'completed' && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleMarkAsPaid(payment)}
                disabled={isProcessing || hasProviderIssue}
                title={hasProviderIssue ? "Prestador não vinculado corretamente" : "Marcar como pago"}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      <PaymentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        payment={payment}
        onEdit={handleEditFromView}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <PaymentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        payment={payment}
        onSave={handleSavePayment}
      />
    </>
  );
};
