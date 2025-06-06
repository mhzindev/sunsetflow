
import { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Eye, DollarSign, Trash2, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Payment } from '@/types/payment';
import { PaymentStatusIndicator } from './PaymentStatusIndicator';
import { PaymentEditModal } from './PaymentEditModal';
import { PaymentViewModal } from './PaymentViewModal';
import { PaymentMarkAsPaidModal } from './PaymentMarkAsPaidModal';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useFinancial } from '@/contexts/FinancialContext';
import { formatCurrency, formatDateForDisplay, parseDatabaseDate, convertToBrasiliaTimezone } from '@/utils/dateUtils';

interface PaymentTableRowProps {
  payment: Payment;
}

export const PaymentTableRow = ({ payment }: PaymentTableRowProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMarkAsPaidModalOpen, setIsMarkAsPaidModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { showSuccess, showError } = useToastFeedback();
  const { deletePayment } = useSupabaseData();
  const { removePayment } = useFinancial();

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await deletePayment(payment.id);
      if (error) {
        showError('Erro', error);
        return;
      }

      removePayment(payment.id);
      showSuccess('Sucesso', 'Pagamento excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      showError('Erro', 'Erro inesperado ao excluir pagamento');
    } finally {
      setIsDeleting(false);
    }
  };

  const getUrgencyBadge = () => {
    if (payment.status === 'completed' || payment.status === 'cancelled') {
      return null;
    }

    const today = new Date();
    const dueDate = parseDatabaseDate(payment.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="secondary">Urgente</Badge>;
    } else if (diffDays <= 7) {
      return <Badge variant="outline">Próximo</Badge>;
    }
    return null;
  };

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
      
      // Formatar para exibição DD/MM/YYYY HH:mm
      const day = String(brasiliaDate.getDate()).padStart(2, '0');
      const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
      const year = brasiliaDate.getFullYear();
      const hours = String(brasiliaDate.getHours()).padStart(2, '0');
      const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.warn('Erro ao formatar created_at:', error);
      return 'Data inválida';
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{payment.providerName}</TableCell>
        <TableCell className="max-w-[200px] truncate" title={payment.description}>
          {payment.description}
        </TableCell>
        <TableCell>{getTypeLabel(payment.type)}</TableCell>
        <TableCell className="font-mono">{formatCurrency(payment.amount)}</TableCell>
        <TableCell>{formatDateForDisplay(payment.dueDate)}</TableCell>
        <TableCell>
          <PaymentStatusIndicator status={payment.status} />
        </TableCell>
        <TableCell>{getUrgencyBadge()}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {/* Mostrar data de criação com tooltip */}
            <div className="group relative">
              <Clock className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Criado em: {formatCreatedAtDate(payment.created_at)}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsViewModalOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {payment.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => setIsMarkAsPaidModalOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Marcar como Pago
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      <PaymentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        payment={payment}
        onSave={() => {
          setIsEditModalOpen(false);
        }}
      />

      <PaymentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        payment={payment}
      />

      <PaymentMarkAsPaidModal
        isOpen={isMarkAsPaidModalOpen}
        onClose={() => setIsMarkAsPaidModalOpen(false)}
        payment={payment}
        onSuccess={() => {
          setIsMarkAsPaidModalOpen(false);
        }}
      />
    </>
  );
};
