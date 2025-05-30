
import { Card } from "@/components/ui/card";
import { Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { Payment } from '@/types/payment';

interface PaymentSummaryCardsProps {
  payments: Payment[];
}

export const PaymentSummaryCards = ({ payments }: PaymentSummaryCardsProps) => {
  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOverdue = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCompleted = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 border-blue-200">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-700">Pendentes</h4>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-red-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-700">Em Atraso</h4>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 border-green-200">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-semibold text-green-700">Pagos (30 dias)</h4>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalCompleted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
