
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Payment, PaymentStatus } from '@/types/payment';

interface PaymentTableRowProps {
  payment: Payment;
}

export const PaymentTableRow = ({ payment }: PaymentTableRowProps) => {
  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    const labels = {
      pending: 'Pendente',
      partial: 'Parcial',
      completed: 'Concluído',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };
    return labels[status];
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

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(payment.dueDate);
  const isUrgent = daysUntilDue <= 3 && payment.status !== 'completed';

  return (
    <TableRow className={isUrgent ? 'bg-red-50' : ''}>
      <TableCell className="font-medium">
        {payment.providerName}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{payment.description}</p>
          {payment.installments && (
            <p className="text-sm text-gray-500">
              {payment.currentInstallment}/{payment.installments} parcelas
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {getTypeLabel(payment.type)}
        </Badge>
      </TableCell>
      <TableCell className="font-semibold">
        R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell>
        {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getStatusIcon(payment.status)}
          <Badge className={getStatusColor(payment.status)}>
            {getStatusLabel(payment.status)}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {payment.status !== 'completed' && (
          <Badge 
            variant={daysUntilDue < 0 ? 'destructive' : daysUntilDue <= 3 ? 'secondary' : 'outline'}
          >
            {daysUntilDue < 0 
              ? `${Math.abs(daysUntilDue)} dias atraso`
              : daysUntilDue === 0 
                ? 'Vence hoje'
                : `${daysUntilDue} dias`
            }
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          {payment.status !== 'completed' && (
            <Button 
              size="sm" 
              className={isUrgent ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              Pagar
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
