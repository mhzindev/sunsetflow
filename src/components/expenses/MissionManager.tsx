import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useEmployees } from '@/hooks/useEmployees';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Plus, Calendar, MapPin, Users, DollarSign, RefreshCw } from 'lucide-react';

interface MissionManagerProps {
  onMissionCreated?: () => void;
}

export const MissionManager = ({ onMissionCreated }: MissionManagerProps) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: '',
    client_id: '',
    client_name: '',
    assigned_employees: [] as string[],
    employee_names: [] as string[],
    status: 'planning'
  });

  const { fetchMissions, fetchClients, insertMission } = useSupabaseData();
  const { employees } = useEmployees();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [missionsData, clientsData] = await Promise.all([
        fetchMissions(),
        fetchClients()
      ]);
      
      console.log('Dados carregados:', { missions: missionsData, clients: clientsData });
      setMissions(missionsData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.location.trim() || !formData.start_date) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.assigned_employees.length === 0) {
      showError('Erro de Validação', 'Por favor, selecione pelo menos um funcionário');
      return;
    }

    try {
      const missionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        client_id: formData.client_id || null,
        client_name: formData.client_name,
        assigned_employees: formData.assigned_employees,
        employee_names: formData.employee_names,
        status: formData.status
      };

      console.log('Criando missão:', missionData);

      const result = await insertMission(missionData);
      
      if (result.error) {
        console.error('Erro ao criar missão:', result.error);
        showError('Erro', result.error);
        return;
      }

      showSuccess('Sucesso', 'Missão criada com sucesso!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        budget: '',
        client_id: '',
        client_name: '',
        assigned_employees: [],
        employee_names: [],
        status: 'planning'
      });
      loadData();
      onMissionCreated?.();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      showError('Erro', 'Erro ao criar missão. Tente novamente.');
    }
  };

  const handleEmployeeToggle = (employeeId: string, employeeName: string) => {
    setFormData(prev => {
      const isSelected = prev.assigned_employees.includes(employeeId);
      
      if (isSelected) {
        return {
          ...prev,
          assigned_employees: prev.assigned_employees.filter(id => id !== employeeId),
          employee_names: prev.employee_names.filter(name => name !== employeeName)
        };
      } else {
        return {
          ...prev,
          assigned_employees: [...prev.assigned_employees, employeeId],
          employee_names: [...prev.employee_names, employeeName]
        };
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { label: 'Planejamento', className: 'bg-blue-100 text-blue-800' },
      'in-progress': { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando missões...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Missões ({missions.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Missão
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Nova Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título da Missão *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Local *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descrição detalhada da missão..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="start_date">Data de Início *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="end_date">Data de Término</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="budget">Orçamento (R$)</Label>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_id">Cliente</Label>
                      <Select value={formData.client_id} onValueChange={(value) => {
                        const selectedClient = clients.find(c => c.id === value);
                        setFormData({
                          ...formData, 
                          client_id: value,
                          client_name: selectedClient?.name || ''
                        });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} {client.company_name && `(${client.company_name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => 
                        setFormData({...formData, status: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planejamento</SelectItem>
                          <SelectItem value="in-progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Funcionários Designados *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {employees.map((employee) => (
                        <label key={employee.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={formData.assigned_employees.includes(employee.id)}
                            onChange={() => handleEmployeeToggle(employee.id, employee.name)}
                            className="rounded"
                          />
                          <span className="text-sm">{employee.name}</span>
                        </label>
                      ))}
                    </div>
                    {formData.assigned_employees.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.employee_names.map((name, index) => (
                          <Badge key={index} variant="outline">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button type="submit" className="flex-1">
                      Criar Missão
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {missions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma missão encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Comece criando sua primeira missão.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Missão
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {missions.map((mission) => (
                <Card key={mission.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{mission.title}</h3>
                        {getStatusBadge(mission.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {mission.location}
                        </p>
                        
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(mission.start_date).toLocaleDateString('pt-BR')}
                          {mission.end_date && ` - ${new Date(mission.end_date).toLocaleDateString('pt-BR')}`}
                        </p>
                        
                        {mission.client_name && (
                          <p><strong>Cliente:</strong> {mission.client_name}</p>
                        )}
                        
                        {mission.budget && (
                          <p className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Orçamento: R$ {Number(mission.budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                        
                        {mission.employee_names && mission.employee_names.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <div className="flex flex-wrap gap-1">
                              {mission.employee_names.map((name: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {mission.description && (
                          <p className="mt-2 text-gray-700">{mission.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
