
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentStatusIndicatorProps {
  status: string;
  hasProviderIssue?: boolean;
}

export const PaymentStatusIndicator = ({ status, hasProviderIssue }: PaymentStatusIndicatorProps) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pendente'
      },
      partial: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: 'Parcial'
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Concluído'
      },
      overdue: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Em Atraso'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        label: 'Cancelado'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (hasProviderIssue) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-orange-100 text-orange-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Sem Prestador
        </Badge>
        <Badge className={config.color}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
