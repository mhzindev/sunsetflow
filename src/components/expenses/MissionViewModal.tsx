
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Users, DollarSign, Clock, Edit, FileText, User, Phone, Mail } from 'lucide-react';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useMissionData } from '@/hooks/useMissionData';
import { MissionWithProvider } from '@/types/mission';
import { useEffect, useState } from 'react';

interface MissionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: MissionWithProvider | null;
  onEdit?: (mission: MissionWithProvider) => void;
}

export const MissionViewModal = ({ isOpen, onClose, mission, onEdit }: MissionViewModalProps) => {
  const { showSuccess } = useToastFeedback();
  const { fetchMissionWithProvider, calculateMissionProgress } = useMissionData();
  const [fullMissionData, setFullMissionData] = useState<MissionWithProvider | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (mission && isOpen) {
      setIsLoadingDetails(true);
      fetchMissionWithProvider(mission.id)
        .then(data => {
          if (data) {
            setFullMissionData(data);
            console.log('Dados completos da missão carregados:', data);
          }
        })
        .finally(() => setIsLoadingDetails(false));
    }
  }, [mission, isOpen, fetchMissionWithProvider]);

  if (!mission) return null;

  const displayMission = fullMissionData || mission;

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

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-orange-100 text-orange-800',
      'no-show-client': 'bg-red-100 text-red-800',
      'no-show-technician': 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Planejamento',
      'in-progress': 'Em Andamento',
      completed: 'Concluída',
      pending: 'Pendente',
      'no-show-client': 'No Show - Cliente',
      'no-show-technician': 'No Show - Técnico',
      cancelled: 'Cancelada'
    };
    return labels[status as keyof typeof labels] || 'Planejamento';
  };

  const calculateDuration = () => {
    if (!displayMission.end_date) return 'Em andamento';
    const start = new Date(displayMission.start_date);
    const end = new Date(displayMission.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  const progress = calculateMissionProgress(displayMission);

  const handleGenerateReport = () => {
    showSuccess('Relatório Gerado', `Relatório da missão "${displayMission.title}" está sendo preparado para download`);
  };

  const handleEditClick = () => {
    onEdit?.(displayMission);
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

        {isLoadingDetails ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-gray-600">Carregando detalhes...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cabeçalho da Missão */}
            <Card className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{displayMission.title}</h3>
                  <p className="text-slate-600">{displayMission.client_name}</p>
                </div>
                <Badge className={getStatusColor(displayMission.status)}>
                  {getStatusLabel(displayMission.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{displayMission.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {new Date(displayMission.start_date).toLocaleDateString('pt-BR')}
                    {displayMission.end_date && ` - ${new Date(displayMission.end_date).toLocaleDateString('pt-BR')}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Duração: {calculateDuration()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Valor do Serviço: {safeFormatCurrency(displayMission.service_value)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Prestador Principal */}
            {displayMission.provider && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Prestador Principal
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-slate-800">{displayMission.provider.name}</div>
                  <div className="text-sm text-gray-600">{displayMission.provider.service}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-1" />
                      {displayMission.provider.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {displayMission.provider.phone}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Prestadores Designados */}
            {displayMission.assigned_providers_details && displayMission.assigned_providers_details.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Prestadores Designados ({displayMission.assigned_providers_details.length})
                </h4>
                <div className="space-y-2">
                  {displayMission.assigned_providers_details.map((provider) => (
                    <div key={provider.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-slate-800">{provider.name}</div>
                      <div className="text-sm text-gray-600">{provider.service}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {provider.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {provider.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Progresso da Missão */}
            {displayMission.status === 'in-progress' && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Progresso da Missão</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="w-full" />
                  <p className="text-sm text-slate-600">{progress.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Despesas: {safeFormatCurrency(progress.completedExpenses)} / 
                    Orçamento: {safeFormatCurrency(progress.totalBudget)}
                  </div>
                </div>
              </Card>
            )}

            {/* Resumo Financeiro */}
            <Card className="p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Resumo Financeiro</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Valor do Serviço</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {safeFormatCurrency(displayMission.service_value)}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Valor da Empresa ({displayMission.company_percentage || 30}%)</p>
                  <p className="text-lg font-semibold text-green-800">
                    {safeFormatCurrency(displayMission.company_value)}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Valor do Prestador ({displayMission.provider_percentage || 70}%)</p>
                  <p className="text-lg font-semibold text-purple-800">
                    {safeFormatCurrency(displayMission.provider_value)}
                  </p>
                </div>
                {displayMission.total_expenses && displayMission.total_expenses > 0 && (
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600">Despesas Registradas</p>
                    <p className="text-lg font-semibold text-orange-800">
                      {safeFormatCurrency(displayMission.total_expenses)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Descrição */}
            {displayMission.description && (
              <Card className="p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Descrição</h4>
                <p className="text-slate-600">{displayMission.description}</p>
              </Card>
            )}

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
        )}
      </DialogContent>
    </Dialog>
  );
};
