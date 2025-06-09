
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
      description: 'Missão em fase de planejamento'
    },
    {
      value: 'in-progress',
      label: 'Em Andamento',
      icon: Clock,
      description: 'Missão sendo executada'
    },
    {
      value: 'completed',
      label: 'Concluída',
      icon: CheckCircle,
      description: 'Missão finalizada com sucesso'
    },
    {
      value: 'no-show-client',
      label: 'No Show Cliente',
      icon: UserX,
      description: 'Cliente não compareceu - valor mantido como receita'
    },
    {
      value: 'no-show-technician',
      label: 'No Show Técnico',
      icon: Wrench,
      description: 'Técnico não compareceu - valor registrado como saída'
    },
    {
      value: 'pending',
      label: 'Pendente',
      icon: AlertTriangle,
      description: 'Missão pendente de resolução'
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
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showFinancialImpact && selectedStatus && (
        <div className="text-xs text-gray-600 mt-1">
          <strong>Impacto financeiro:</strong> {selectedStatus.description}
        </div>
      )}
    </div>
  );
};
