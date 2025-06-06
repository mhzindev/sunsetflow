
import { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Eye, Edit, DollarSign } from 'lucide-react';
import { Payment } from '@/types/payment';
import { PaymentViewModal } from './PaymentViewModal';
import { PaymentEditModal } from './PaymentEditModal';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { supabase } from '@/integrations/supabase/client';

interface PaymentTableRowProps {
  payment: Payment;
  onPaymentUpdate?: () => void;
}

export const PaymentTableRow = ({ payment, onPaymentUpdate }: PaymentTableRowProps) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useToastFeedback();

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

  const handleSavePayment = (updatedPayment: Payment) => {
    console.log('Payment updated via modal:', updatedPayment);
    showSuccess('Sucesso', 'Pagamento atualizado com sucesso!');
    onPaymentUpdate?.();
  };

  const handleMarkAsPaid = async (payment: Payment) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('=== INICIANDO PROCESSO DE PAGAMENTO ===');
      console.log('Payment ID:', payment.id);
      console.log('Provider ID:', payment.providerId);
      console.log('Provider Name:', payment.providerName);
      console.log('Amount:', payment.amount);
      
      // Verificar se o pagamento ainda existe e está pendente
      const { data: currentPayment, error: checkError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.id)
        .single();

      if (checkError) {
        console.error('Erro ao verificar pagamento:', checkError);
        showError('Erro', 'Erro ao verificar status do pagamento: ' + checkError.message);
        return;
      }

      if (currentPayment.status === 'completed') {
        console.log('✅ Pagamento já estava marcado como concluído');
        showSuccess('Informação', 'Pagamento já estava marcado como concluído!');
        onPaymentUpdate?.();
        return;
      }

      console.log('Status atual do pagamento:', currentPayment.status);
      
      // Atualizar o pagamento no banco de dados com logs detalhados
      const { data: updatedData, error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', payment.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Erro ao atualizar pagamento:', updateError);
        showError('Erro', 'Erro ao processar pagamento: ' + updateError.message);
        return;
      }

      console.log('✅ Pagamento atualizado no banco:', updatedData);

      // Aguardar um momento para o trigger ser executado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se o trigger funcionou recalculando o saldo manualmente se necessário
      if (payment.providerId) {
        console.log('Verificando e recalculando saldo do prestador:', payment.providerId);
        
        const { data: recalculateData, error: recalculateError } = await supabase.rpc(
          'recalculate_provider_balance', 
          { provider_uuid: payment.providerId }
        );

        if (recalculateError) {
          console.error('Erro ao recalcular saldo:', recalculateError);
          showError('Aviso', 'Pagamento processado mas erro ao recalcular saldo: ' + recalculateError.message);
        } else {
          console.log('✅ Saldo recalculado com sucesso. Novo saldo:', recalculateData);
        }
      } else {
        console.log('⚠️ Pagamento sem provider_id - saldo não será recalculado');
      }
      
      showSuccess(
        'Pagamento Confirmado', 
        `Pagamento de R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ${payment.providerName} foi processado! Status atualizado para concluído.`
      );

      // Forçar refresh dos dados com delay para garantir que o banco atualizou
      console.log('Executando refresh dos dados...');
      setTimeout(() => {
        onPaymentUpdate?.();
      }, 1000);
      
    } catch (error) {
      console.error('Erro inesperado ao processar pagamento:', error);
      showError('Erro', 'Erro inesperado ao processar pagamento');
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
      <TableRow>
        <TableCell className="font-medium">{payment.providerName}</TableCell>
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
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {payment.status !== 'completed' && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleMarkAsPaid(payment)}
                disabled={isProcessing}
              >
                <DollarSign className="w-4 h-4" />
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
