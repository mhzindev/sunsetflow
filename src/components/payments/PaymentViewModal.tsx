
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, CreditCard, FileText, Edit, Clock, AlertTriangle } from 'lucide-react';
import { Payment } from '@/types/payment';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface PaymentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onEdit?: (payment: Payment) => void;
  onMarkAsPaid?: (payment: Payment) => void;
}

export const PaymentViewModal = ({ isOpen, onClose, payment, onEdit, onMarkAsPaid }: PaymentViewModalProps) => {
  const { showSuccess } = useToastFeedback();

  if (!payment) return null;

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

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    return dueDate < today && payment.status !== 'completed';
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMarkAsPaid = () => {
    onMarkAsPaid?.(payment);
    onClose();
  };

  const handleEditClick = () => {
    onEdit?.(payment);
    onClose();
  };

  const handleGenerateReceipt = () => {
    showSuccess('Comprovante Gerado', `Comprovante do pagamento para ${payment.providerName} está sendo preparado para download`);
  };

  // Safe calculation functions for installments
  const getInstallmentValue = () => {
    if (!payment.amount || !payment.installments || payment.installments === 0) return 0;
    return payment.amount / payment.installments;
  };

  const getRemainingAmount = () => {
    if (!payment.amount || !payment.installments || !payment.currentInstallment) return payment.amount || 0;
    const remaining = payment.installments - payment.currentInstallment;
    return (payment.amount * remaining) / payment.installments;
  };

  // Safe formatter for currency values
  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = value || 0;
    return safeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Detalhes do Pagamento</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alertas de Urgência */}
          {isOverdue() && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Pagamento em Atraso</p>
                  <p className="text-sm text-red-600">
                    Este pagamento está {Math.abs(daysUntilDue)} dia{Math.abs(daysUntilDue) > 1 ? 's' : ''} em atraso
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!isOverdue() && daysUntilDue <= 3 && daysUntilDue >= 0 && (
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Vencimento Próximo</p>
                  <p className="text-sm text-yellow-600">
                    Este pagamento vence em {daysUntilDue} dia{daysUntilDue > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Informações Principais */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{payment.providerName}</h3>
                <p className="text-slate-600">{payment.description}</p>
              </div>
              <Badge className={getStatusColor(payment.status)}>
                {getStatusLabel(payment.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-sm text-slate-500">Valor:</span>
                  <span className="ml-2 font-semibold text-lg">
                    R$ {formatCurrency(payment.amount)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-sm text-slate-500">Vencimento:</span>
                  <span className="ml-2 font-medium">
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-sm text-slate-500">Tipo:</span>
                  <span className="ml-2 font-medium">{getTypeLabel(payment.type)}</span>
                </div>
              </div>
              {payment.paymentDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-sm text-slate-500">Pago em:</span>
                    <span className="ml-2 font-medium">
                      {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Informações de Parcelamento */}
          {payment.type === 'installment' && payment.installments && payment.installments > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Informações de Parcelamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Parcela Atual</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {payment.currentInstallment || 1} de {payment.installments}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Valor da Parcela</p>
                  <p className="text-lg font-semibold text-green-800">
                    R$ {formatCurrency(getInstallmentValue())}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Total Restante</p>
                  <p className="text-lg font-semibold text-purple-800">
                    R$ {formatCurrency(getRemainingAmount())}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Observações */}
          {payment.notes && (
            <Card className="p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Observações</h4>
              <p className="text-slate-600 bg-gray-50 p-3 rounded-lg">{payment.notes}</p>
            </Card>
          )}

          <Separator />

          {/* Ações */}
          <div className="flex space-x-2">
            {payment.status !== 'completed' && (
              <Button onClick={handleMarkAsPaid} className="bg-green-600 hover:bg-green-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Marcar como Pago
              </Button>
            )}
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleGenerateReceipt}>
              <FileText className="w-4 h-4 mr-2" />
              Gerar Comprovante
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
