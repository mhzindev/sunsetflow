
import { Card } from "@/components/ui/card";
import { Payment } from '@/types/payment';
import { Clock, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';

interface PaymentSummaryCardsProps {
  payments: Payment[];
}

export const PaymentSummaryCards = ({ payments }: PaymentSummaryCardsProps) => {
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  
  const totalPendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagamentos Pendentes</p>
            <p className="text-2xl font-semibold text-gray-900">{pendingPayments}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagamentos Concluídos</p>
            <p className="text-2xl font-semibold text-gray-900">{completedPayments}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagamentos em Atraso</p>
            <p className="text-2xl font-semibold text-gray-900">{overduePayments}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Valor Pendente</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalPendingAmount)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
