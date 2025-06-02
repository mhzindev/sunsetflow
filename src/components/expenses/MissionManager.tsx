
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Plus, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MissionManagerProps {
  onMissionCreated?: () => void;
}

export const MissionManager = ({ onMissionCreated }: MissionManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: '',
    client_name: '', // Campo de texto livre
    employee_names: '' // Campo de texto para separar por vírgula
  });

  const { fetchMissions, insertMission } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const data = await fetchMissions();
      setMissions(data);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
      showError('Erro', 'Erro ao carregar missões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.start_date) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Processar nomes dos funcionários (separados por vírgula)
      const employeeNames = formData.employee_names
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      const missionData = {
        title: formData.title,
        description: formData.description || null,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        client_name: formData.client_name || null, // Campo de texto livre
        employee_names: employeeNames.length > 0 ? employeeNames : null,
        status: 'planning'
      };

      console.log('Criando missão:', missionData);

      const { data, error } = await insertMission(missionData);
      
      if (error) {
        console.error('Erro ao criar missão:', error);
        showError('Erro', `Erro ao criar missão: ${error}`);
        return;
      }

      console.log('Missão criada com sucesso:', data);
      showSuccess('Sucesso', 'Missão criada com sucesso!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        budget: '',
        client_name: '',
        employee_names: ''
      });
      
      setShowForm(false);
      loadMissions();
      onMissionCreated?.();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      showError('Erro', 'Erro inesperado ao criar missão');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planejamento';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (showForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Nova Missão</h3>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancelar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Instalação São Paulo"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Local *</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: São Paulo, SP"
                required
              />
            </div>

            <div>
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="client_name">Cliente</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div>
              <Label htmlFor="budget">Orçamento</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="employee_names">Funcionários</Label>
            <Input
              value={formData.employee_names}
              onChange={(e) => setFormData(prev => ({ ...prev, employee_names: e.target.value }))}
              placeholder="Separe os nomes por vírgula: João Silva, Maria Santos"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os detalhes da missão..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit">
              Criar Missão
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Missões ({missions.length})
        </h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Missão
        </Button>
      </div>

      {loading ? (
        <Card className="p-6">
          <div className="text-center">Carregando missões...</div>
        </Card>
      ) : missions.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma missão encontrada
            </h4>
            <p className="text-gray-500 mb-4">
              Crie sua primeira missão para começar a organizar as despesas de viagem
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Missão
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {mission.title}
                  </h4>
                  <Badge className={getStatusColor(mission.status)}>
                    {getStatusText(mission.status)}
                  </Badge>
                </div>
                {mission.budget && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Orçamento</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(mission.budget)}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{mission.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(mission.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                    {mission.end_date && (
                      <> - {format(new Date(mission.end_date), 'dd/MM/yyyy', { locale: ptBR })}</>
                    )}
                  </span>
                </div>

                {mission.client_name && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Cliente:</span>
                    <span>{mission.client_name}</span>
                  </div>
                )}

                {mission.employee_names && mission.employee_names.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{mission.employee_names.join(', ')}</span>
                  </div>
                )}

                {mission.total_expenses && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Despesas: {formatCurrency(mission.total_expenses)}</span>
                  </div>
                )}
              </div>

              {mission.description && (
                <div className="mt-4 text-sm text-gray-600">
                  <strong>Descrição:</strong> {mission.description}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
