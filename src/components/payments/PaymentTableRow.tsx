
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
      partial: 'Parcial',
      balance_payment: 'Pagamento de Saldo'
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
      console.log('Status atual:', payment.status);
      console.log('É órfão?:', !payment.providerId);
      
      // Verificar se o pagamento existe no banco de dados
      console.log('Verificando existência do pagamento...');
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.id)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar pagamento:', checkError);
        showError('Erro', 'Erro ao verificar status do pagamento: ' + checkError.message);
        return;
      }

      if (!existingPayment) {
        console.log('❌ Pagamento não encontrado no banco de dados');
        showError('Erro', 'Pagamento não encontrado no banco de dados');
        return;
      }

      console.log('✅ Pagamento encontrado no banco:', existingPayment);

      if (existingPayment.status === 'completed') {
        console.log('✅ Pagamento já estava marcado como concluído');
        showSuccess('Informação', 'Pagamento já estava marcado como concluído!');
        onPaymentUpdate?.();
        return;
      }

      // Preparar dados de atualização
      const updateData = { 
        status: 'completed',
        payment_date: new Date().toISOString().split('T')[0]
      };

      console.log('Dados para atualização:', updateData);
      console.log('Atualizando pagamento no banco...');
      
      // Usar apenas o ID como filtro
      const { data: updatedData, error: updateError } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', payment.id)
        .select('*');

      if (updateError) {
        console.error('Erro ao atualizar pagamento:', updateError);
        showError('Erro', 'Erro ao processar pagamento: ' + updateError.message);
        return;
      }

      if (!updatedData || updatedData.length === 0) {
        console.error('❌ Nenhum pagamento foi atualizado');
        showError('Erro', 'Falha ao atualizar o pagamento');
        return;
      }

      console.log('✅ Pagamento atualizado no banco:', updatedData[0]);

      // Aguardar triggers serem executados
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar se tem provider_id válido antes de recalcular saldo
      const providerId = payment.providerId;
      if (providerId && providerId !== 'undefined' && providerId.trim() !== '' && providerId !== 'null') {
        console.log('Recalculando saldo do prestador:', providerId);
        
        try {
          const { data: recalculateData, error: recalculateError } = await supabase.rpc(
            'recalculate_provider_balance', 
            { provider_uuid: providerId }
          );

          if (recalculateError) {
            console.error('Erro ao recalcular saldo:', recalculateError);
            showError('Aviso', 'Pagamento processado mas erro ao recalcular saldo: ' + recalculateError.message);
          } else {
            console.log('✅ Saldo recalculado com sucesso. Novo saldo:', recalculateData);
          }
        } catch (recalcError) {
          console.error('Erro inesperado no recálculo:', recalcError);
        }
      } else {
        console.log('⚠️ Pagamento órfão - saldo não será recalculado');
        console.log('Provider ID recebido:', providerId);
        
        // Aviso especial para pagamentos órfãos
        showSuccess(
          'Pagamento Órfão Processado', 
          `Pagamento de R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi marcado como concluído. ⚠️ Este pagamento não está vinculado a um prestador específico.`
        );
        
        setTimeout(() => {
          onPaymentUpdate?.();
        }, 1000);
        return;
      }
      
      showSuccess(
        'Pagamento Confirmado', 
        `Pagamento de R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ${payment.providerName} foi processado!`
      );

      setTimeout(() => {
        onPaymentUpdate?.();
      }, 1000);
      
    } catch (error) {
      console.error('Erro inesperado ao processar pagamento:', error);
      showError('Erro', 'Erro inesperado ao processar pagamento: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
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

  // Verificar se é um pagamento órfão
  const isOrphanPayment = !payment.providerId || payment.providerId === '' || payment.providerId === 'undefined';

  return (
    <>
      <TableRow className={isOrphanPayment ? 'bg-orange-50 border-l-4 border-l-orange-400' : ''}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span>{payment.providerName || 'Prestador não especificado'}</span>
            {isOrphanPayment && (
              <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                Órfão
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>{payment.description || 'Sem descrição'}</TableCell>
        <TableCell>{getTypeLabel(payment.type)}</TableCell>
        <TableCell className="font-semibold">
          R$ {payment.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </TableCell>
        <TableCell>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('pt-BR') : 'Data inválida'}</TableCell>
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
