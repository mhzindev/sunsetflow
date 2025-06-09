
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Clock, UserX, Wrench } from 'lucide-react';

interface MissionStatusSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  showFinancialImpact?: boolean;
}

export const MissionStatusSelector = ({
  value,
  onValueChange,
  disabled = false,
  showFinancialImpact = false
}: MissionStatusSelectorProps) => {
  const statusOptions = [
    {
      value: 'planning',
      label: 'Planejamento',
      icon: Clock,
      description: 'Missão em fase de planejamento - sem impacto financeiro'
    },
    {
      value: 'in-progress',
      label: 'Em Andamento',
      icon: Clock,
      description: 'Missão sendo executada - sem impacto financeiro'
    },
    {
      value: 'completed',
      label: 'Concluída',
      icon: CheckCircle,
      description: 'Cria receita pendente automaticamente para recebimento'
    },
    {
      value: 'no-show-client',
      label: 'No Show Cliente',
      icon: UserX,
      description: 'Registra receita automaticamente - valor mantido pela empresa'
    },
    {
      value: 'no-show-technician',
      label: 'No Show Técnico',
      icon: Wrench,
      description: 'Registra despesa automaticamente - valor perdido pela empresa'
    },
    {
      value: 'pending',
      label: 'Pendente',
      icon: AlertTriangle,
      description: 'Aguardando resolução - sem impacto financeiro'
    }
  ];

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'completed':
        return 'text-green-600';
      case 'no-show-client':
        return 'text-blue-600';
      case 'no-show-technician':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'in-progress':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFinancialImpactColor = (statusValue: string) => {
    switch (statusValue) {
      case 'completed':
      case 'no-show-client':
        return 'text-green-700 bg-green-50';
      case 'no-show-technician':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const selectedStatus = statusOptions.find(option => option.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="mission-status">Status da Missão</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status">
            {selectedStatus && (
              <div className="flex items-center gap-2">
                <selectedStatus.icon className={`w-4 h-4 ${getStatusColor(value)}`} />
                <span>{selectedStatus.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2 w-full">
                <option.icon className={`w-4 h-4 ${getStatusColor(option.value)}`} />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {showFinancialImpact && (
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showFinancialImpact && selectedStatus && (
        <div className={`text-xs p-2 rounded-md border ${getFinancialImpactColor(selectedStatus.value)}`}>
          <strong>Impacto financeiro:</strong> {selectedStatus.description}
          {(selectedStatus.value === 'no-show-client' || selectedStatus.value === 'no-show-technician' || selectedStatus.value === 'completed') && (
            <div className="mt-1 text-xs opacity-80">
              ⚡ Transação será criada automaticamente ao alterar para este status
            </div>
          )}
        </div>
      )}
    </div>
  );
};
