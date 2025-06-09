
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, DollarSign, Clock, Edit, FileText } from 'lucide-react';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface Mission {
  id: string;
  title: string;
  client: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: string;
  assignedEmployees: string[];
  totalExpenses: number;
  description?: string;
  progress?: number;
}

interface MissionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
  onEdit?: (mission: Mission) => void;
}

export const MissionViewModal = ({ isOpen, onClose, mission, onEdit }: MissionViewModalProps) => {
  const { showSuccess } = useToastFeedback();

  if (!mission) return null;

  // Função segura para formatar valores monetários
  const safeFormatCurrency = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  // Função segura para formatar números
  const safeFormatNumber = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0';
    }
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.planned;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planned: 'Planejada',
      'in-progress': 'Em Andamento',
      completed: 'Concluída'
    };
    return labels[status as keyof typeof labels] || 'Planejada';
  };

  const calculateDuration = () => {
    if (!mission.endDate) return 'Em andamento';
    const start = new Date(mission.startDate);
    const end = new Date(mission.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  const calculateBudgetRemaining = (): number => {
    const budget = 10000; // Orçamento padrão
    const expenses = mission.totalExpenses || 0;
    return budget - expenses;
  };

  const calculateCostPerDay = (): number => {
    const expenses = mission.totalExpenses || 0;
    const duration = calculateDuration();
    
    if (duration === 'Em andamento') return expenses;
    
    const days = parseInt(duration);
    if (isNaN(days) || days <= 0) return expenses;
    
    return expenses / days;
  };

  const handleGenerateReport = () => {
    showSuccess('Relatório Gerado', `Relatório da missão "${mission.title}" está sendo preparado para download`);
  };

  const handleEditClick = () => {
    onEdit?.(mission);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Detalhes da Missão</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho da Missão */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{mission.title}</h3>
                <p className="text-slate-600">{mission.client}</p>
              </div>
              <Badge className={getStatusColor(mission.status)}>
                {getStatusLabel(mission.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">{mission.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {new Date(mission.startDate).toLocaleDateString('pt-BR')}
                  {mission.endDate && ` - ${new Date(mission.endDate).toLocaleDateString('pt-BR')}`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Duração: {calculateDuration()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  Despesas: {safeFormatCurrency(mission.totalExpenses)}
                </span>
              </div>
            </div>
          </Card>

          {/* Equipe Designada */}
          <Card className="p-4">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Equipe Designada
            </h4>
            <div className="flex flex-wrap gap-2">
              {mission.assignedEmployees.map((employee, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {employee}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Progresso da Missão */}
          {mission.status === 'in-progress' && (
            <Card className="p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Progresso</h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${mission.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600">{mission.progress || 0}% concluído</p>
            </Card>
          )}

          {/* Resumo Financeiro */}
          <Card className="p-4">
            <h4 className="font-semibold text-slate-800 mb-3">Resumo Financeiro</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total de Despesas</p>
                <p className="text-lg font-semibold text-blue-800">
                  {safeFormatCurrency(mission.totalExpenses)}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Orçamento Restante</p>
                <p className="text-lg font-semibold text-green-800">
                  {safeFormatCurrency(calculateBudgetRemaining())}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Custo por Dia</p>
                <p className="text-lg font-semibold text-purple-800">
                  {safeFormatCurrency(calculateCostPerDay())}
                </p>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Ações */}
          <div className="flex space-x-4">
            <Button onClick={handleEditClick} className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Editar Missão
            </Button>
            <Button variant="outline" onClick={handleGenerateReport} className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
