
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

  const cards = [
    {
      title: "Pendentes",
      value: totalPending,
      icon: Clock,
      color: "text-blue-600",
      borderColor: "border-blue-200",
      tooltip: "Pagamentos agendados ou em processamento que ainda não foram efetivados. Monitore esta seção para garantir que os pagamentos sejam feitos dentro dos prazos acordados com prestadores."
    },
    {
      title: "Em Atraso",
      value: totalOverdue,
      icon: AlertTriangle,
      color: "text-red-600",
      borderColor: "border-red-200",
      tooltip: "Pagamentos que ultrapassaram o prazo de vencimento. Priorize estes pagamentos para evitar penalidades, juros e deterioração do relacionamento com fornecedores."
    },
    {
      title: "Pagos (30 dias)",
      value: totalCompleted,
      icon: DollarSign,
      color: "text-green-600",
      borderColor: "border-green-200",
      tooltip: "Total de pagamentos efetivados nos últimos 30 dias. Este valor ajuda a acompanhar o volume de saídas para prestadores de serviços e controlar o fluxo de caixa."
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={`p-4 ${card.borderColor}`}>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{card.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                <div>
                  <h4 className={`font-semibold ${card.color.replace('text-', 'text-')}`}>{card.title}</h4>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
