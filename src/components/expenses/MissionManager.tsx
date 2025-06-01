
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { MissionViewModal } from './MissionViewModal';
import { MissionEditModal } from './MissionEditModal';

interface MissionManagerProps {
  onMissionCreated?: () => void;
}

export const MissionManager = ({ onMissionCreated }: MissionManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const { showSuccess, showError } = useToastFeedback();
  const { fetchMissions, fetchClients, insertMission } = useSupabaseData();
  
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    assignedEmployees: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [missionsData, clientsData] = await Promise.all([
        fetchMissions(),
        fetchClients()
      ]);
      setMissions(missionsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Erro ao carregar dados das missões');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Planejada',
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
      const selectedClient = clients.find(c => c.name === formData.client);
      
      const missionData = {
        title: formData.title,
        description: `Missão: ${formData.title}`,
        location: formData.location,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        client_name: formData.client,
        client_id: selectedClient?.id || null,
        employee_names: formData.assignedEmployees,
        status: 'planning'
      };

      const { data, error } = await insertMission(missionData);
      
      if (error) {
        throw new Error(error);
      }
      
      showSuccess('Missão Criada', `A missão "${formData.title}" foi criada com sucesso!`);
      setShowForm(false);
      resetForm();
      loadData(); // Recarregar dados
      onMissionCreated?.();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      showError('Erro', 'Erro ao criar missão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMission = (missionId: string, missionTitle: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      setSelectedMission(mission);
      setIsViewModalOpen(true);
    }
  };

  const handleEditMission = (missionId: string, missionTitle: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      setSelectedMission(mission);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveMission = (updatedMission: any) => {
    console.log('Mission updated:', updatedMission);
    showSuccess('Sucesso', 'Missão atualizada com sucesso!');
    loadData(); // Recarregar dados
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
                <select
                  id="client"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
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
            {missions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Nenhuma missão encontrada. Crie sua primeira missão!
                </TableCell>
              </TableRow>
            ) : (
              missions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium">{mission.title}</TableCell>
                  <TableCell>{mission.client_name || 'N/A'}</TableCell>
                  <TableCell>{mission.location}</TableCell>
                  <TableCell>
                    {new Date(mission.start_date).toLocaleDateString('pt-BR')}
                    {mission.end_date && ` - ${new Date(mission.end_date).toLocaleDateString('pt-BR')}`}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(mission.status)}>
                      {getStatusLabel(mission.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {mission.employee_names?.map((employee: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {employee}
                        </Badge>
                      )) || <span className="text-gray-500">Nenhum</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {(mission.total_expenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
