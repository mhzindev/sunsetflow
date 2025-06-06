
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User, FileText, CreditCard, Clock } from 'lucide-react';
import { Payment } from '@/types/payment';
import { PaymentStatusIndicator } from './PaymentStatusIndicator';
import { formatCurrency, formatDateForDisplay, convertToBrasiliaTimezone } from '@/utils/dateUtils';

interface PaymentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PaymentViewModal = ({ isOpen, onClose, payment }: PaymentViewModalProps) => {
  if (!payment) return null;

  const getTypeLabel = (type: string) => {
    const labels = {
      full: 'Integral',
      installment: 'Parcelado',
      advance: 'Adiantamento',
      balance_payment: 'Saldo',
      advance_payment: 'Antecipação'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Função para formatar created_at no timezone de Brasília
  const formatCreatedAtDate = (created_at?: string) => {
    if (!created_at) return 'N/A';
    
    try {
      // Parse da data do banco (UTC)
      const utcDate = new Date(created_at);
      
      // Converter para timezone de Brasília
      const brasiliaDate = convertToBrasiliaTimezone(utcDate);
      
      // Formatar para exibição completa
      const day = String(brasiliaDate.getDate()).padStart(2, '0');
      const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
      const year = brasiliaDate.getFullYear();
      const hours = String(brasiliaDate.getHours()).padStart(2, '0');
      const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
      const seconds = String(brasiliaDate.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.warn('Erro ao formatar created_at:', error);
      return 'Data inválida';
    }
  };

  // Função para formatar payment_date no timezone de Brasília
  const formatPaymentDate = (paymentDate?: string) => {
    if (!paymentDate) return null;
    
    try {
      // Se é uma data simples YYYY-MM-DD, usar formatDateForDisplay
      if (/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
        return formatDateForDisplay(paymentDate);
      }
      
      // Se é uma data completa com hora, converter timezone
      const utcDate = new Date(paymentDate);
      const brasiliaDate = convertToBrasiliaTimezone(utcDate);
      
      const day = String(brasiliaDate.getDate()).padStart(2, '0');
      const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
      const year = brasiliaDate.getFullYear();
      const hours = String(brasiliaDate.getHours()).padStart(2, '0');
      const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch (error) {
      console.warn('Erro ao formatar payment_date:', error);
      return 'Data inválida';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detalhes do Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Tipo */}
          <div className="flex items-center justify-between">
            <PaymentStatusIndicator status={payment.status} size="lg" />
            <Badge variant="outline" className="text-sm">
              {getTypeLabel(payment.type)}
            </Badge>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Prestador</p>
                  <p className="font-semibold">{payment.providerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Vencimento</p>
                  <p className="font-medium">{formatDateForDisplay(payment.dueDate)}</p>
                </div>
              </div>

              {payment.paymentDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Pagamento</p>
                    <p className="font-medium">{formatPaymentDate(payment.paymentDate)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Data de Criação com timezone correto */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Criado em</p>
                  <p className="font-medium">{formatCreatedAtDate(payment.created_at)}</p>
                </div>
              </div>

              {payment.account_id && payment.account_type && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Conta Vinculada</p>
                    <p className="font-medium">
                      {payment.account_type === 'bank_account' ? '💳 Conta Bancária' : '🏦 Cartão de Crédito'}
                    </p>
                  </div>
                </div>
              )}

              {payment.type === 'installment' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Parcelamento</p>
                  <p className="font-medium">
                    {payment.currentInstallment || 1} de {payment.installments || 1} parcelas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Descrição</p>
            <p className="p-3 bg-gray-50 rounded-lg border">{payment.description}</p>
          </div>

          {/* Observações */}
          {payment.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Observações</p>
              <p className="p-3 bg-gray-50 rounded-lg border">{payment.notes}</p>
            </div>
          )}

          {/* Tags */}
          {payment.tags && payment.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {payment.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
