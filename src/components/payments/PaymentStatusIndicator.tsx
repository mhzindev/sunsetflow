
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentStatusIndicatorProps {
  status: string;
  hasProviderIssue?: boolean;
  hasAccountIssue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PaymentStatusIndicator = ({ 
  status, 
  hasProviderIssue = false, 
  hasAccountIssue = false,
  size = 'md'
}: PaymentStatusIndicatorProps) => {
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

  const getSizeClasses = (size: string) => {
    const sizeClasses = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-2.5 py-1',
      lg: 'text-base px-3 py-1.5'
    };
    return sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  };

  const getIconSize = (size: string) => {
    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };
    return iconSizes[size as keyof typeof iconSizes] || iconSizes.md;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const iconSize = getIconSize(size);

  return (
    <div className="flex items-center gap-2">
      {hasProviderIssue && (
        <Badge className={`bg-orange-100 text-orange-800 ${getSizeClasses(size)}`}>
          <AlertCircle className={`${iconSize} mr-1`} />
          Sem Prestador
        </Badge>
      )}
      
      {hasAccountIssue && status === 'completed' && (
        <Badge className={`bg-red-100 text-red-800 ${getSizeClasses(size)}`}>
          <AlertCircle className={`${iconSize} mr-1`} />
          Sem Conta
        </Badge>
      )}
      
      <Badge className={`${config.color} ${getSizeClasses(size)}`}>
        <Icon className={`${iconSize} mr-1`} />
        {config.label}
      </Badge>
    </div>
  );
};
