import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { MissionViewModal } from './MissionViewModal';
import { MissionEditModal } from './MissionEditModal';

interface MissionManagerProps {
  onMissionCreated?: () => void;
}

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
}

export const MissionManager = ({ onMissionCreated }: MissionManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showSuccess, showError } = useToastFeedback();
  
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    assignedEmployees: [] as string[]
  });

  const mockMissions = [
    {
      id: '1',
      title: 'Instalação - Cliente ABC',
      client: 'ABC Transportes',
      location: 'São Paulo/SP',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'completed',
      assignedEmployees: ['Carlos Santos', 'Ana Silva'],
      totalExpenses: 1180.50
    },
    {
      id: '2',
      title: 'Manutenção - Cliente XYZ',
      client: 'XYZ Logística',
      location: 'Rio de Janeiro/RJ',
      startDate: '2024-01-20',
      endDate: '2024-01-21',
      status: 'in-progress',
      assignedEmployees: ['João Oliveira'],
      totalExpenses: 690.40
    },
    {
      id: '3',
      title: 'Instalação - Cliente DEF',
      client: 'DEF Cargas',
      location: 'Belo Horizonte/MG',
      startDate: '2024-01-25',
      endDate: '2024-01-26',
      status: 'planned',
      assignedEmployees: ['Carlos Santos'],
      totalExpenses: 0
    }
  ];

  const mockEmployees = [
    { id: '1', name: 'Ana Silva (Proprietária)' },
    { id: '2', name: 'Carlos Santos' },
    { id: '3', name: 'João Oliveira' }
  ];

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

  const resetForm = () => {
    setFormData({
      title: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      assignedEmployees: []
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    showSuccess('Cancelado', 'Operação cancelada com sucesso');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.client.trim() || !formData.location.trim() || !formData.startDate) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Mission created:', {
        ...formData,
        id: Date.now().toString(),
        status: 'planned',
        totalExpenses: 0
      });
      
      showSuccess('Missão Criada', `A missão "${formData.title}" foi criada com sucesso!`);
      setShowForm(false);
      resetForm();
      onMissionCreated?.();
    } catch (error) {
      showError('Erro', 'Erro ao criar missão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMission = (missionId: string, missionTitle: string) => {
    const mission = mockMissions.find(m => m.id === missionId);
    if (mission) {
      setSelectedMission(mission);
      setIsViewModalOpen(true);
    }
  };

  const handleEditMission = (missionId: string, missionTitle: string) => {
    const mission = mockMissions.find(m => m.id === missionId);
    if (mission) {
      setSelectedMission(mission);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveMission = (updatedMission: any) => {
    console.log('Mission updated:', updatedMission);
    showSuccess('Sucesso', 'Missão atualizada com sucesso!');
  };

  const handleEditFromView = (mission: any) => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedMission(mission);
      setIsEditModalOpen(true);
    }, 100);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedMission(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Gerenciar Missões</h4>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Nova Missão'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Missão *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Instalação - Cliente ABC"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  placeholder="Nome do cliente"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                placeholder="Cidade/Estado"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data de Término (Prevista)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Missão'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Missão</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Funcionários</TableHead>
              <TableHead>Total Despesas</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMissions.map((mission) => (
              <TableRow key={mission.id}>
                <TableCell className="font-medium">{mission.title}</TableCell>
                <TableCell>{mission.client}</TableCell>
                <TableCell>{mission.location}</TableCell>
                <TableCell>
                  {new Date(mission.startDate).toLocaleDateString('pt-BR')}
                  {mission.endDate && ` - ${new Date(mission.endDate).toLocaleDateString('pt-BR')}`}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(mission.status)}>
                    {getStatusLabel(mission.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {mission.assignedEmployees.map((employee, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {employee}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  R$ {mission.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMission(mission.id, mission.title)}
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditMission(mission.id, mission.title)}
                    >
                      Editar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Import and add the modals */}
      <MissionViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        mission={selectedMission}
        onEdit={handleEditFromView}
      />

      <MissionEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        mission={selectedMission}
        onSave={handleSaveMission}
      />
    </div>
  );
};
