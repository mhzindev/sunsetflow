
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { ServiceValueDistribution } from '@/components/missions/ServiceValueDistribution';
import { ServiceProviderSelector } from '@/components/missions/ServiceProviderSelector';
import { MissionViewModal } from './MissionViewModal';
import { MissionEditModal } from './MissionEditModal';
import { Plus, Calendar, MapPin, Users, DollarSign, RefreshCw, CheckCircle, Clock, MoreHorizontal, Eye, Edit, Settings } from 'lucide-react';
import { isAdmin } from '@/utils/authUtils';

interface MissionManagerProps {
  onMissionCreated?: () => void;
}

export const MissionManager = ({ onMissionCreated }: MissionManagerProps) => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    service_value: 0,
    company_percentage: 30,
    provider_percentage: 70
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    client_name: '',
    assigned_providers: [] as string[],
    status: 'planning'
  });

  const { fetchMissions, insertMission, updateMission } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();
  const { user, profile } = useAuth();

  // Verificar se o usuário é admin
  const userIsAdmin = isAdmin(profile);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const missionsData = await fetchMissions();
      
      console.log('Dados carregados:', { missions: missionsData });
      setMissions(missionsData || []);
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

    if (formData.assigned_providers.length === 0) {
      showError('Erro de Validação', 'Por favor, selecione pelo menos um prestador de serviço');
      return;
    }

    try {
      const missionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        client_name: formData.client_name,
        assigned_providers: formData.assigned_providers,
        status: formData.status,
        // CORREÇÃO: Prestadores não podem mais definir valores
        service_value: 0,
        company_percentage: 30,
        provider_percentage: 70,
        company_value: 0,
        provider_value: 0
      };

      console.log('Criando missão:', missionData);

      const result = await insertMission(missionData);
      
      if (result.error) {
        console.error('Erro ao criar missão:', result.error);
        showError('Erro', result.error);
        return;
      }

      showSuccess('Sucesso', 'Missão criada com sucesso! Aguardando aprovação do administrador para definir valores.');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        client_name: '',
        assigned_providers: [],
        status: 'planning'
      });
      loadData();
      onMissionCreated?.();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      showError('Erro', 'Erro ao criar missão. Tente novamente.');
    }
  };

  const handleViewMission = (mission: any) => {
    setSelectedMission(mission);
    setShowViewModal(true);
  };

  const handleEditMission = (mission: any) => {
    setSelectedMission(mission);
    setShowEditModal(true);
  };

  const handleApprovalModalOpen = (mission: any) => {
    setSelectedMission(mission);
    setApprovalData({
      service_value: mission.service_value || 0,
      company_percentage: mission.company_percentage || 30,
      provider_percentage: mission.provider_percentage || 70
    });
    setShowApprovalModal(true);
  };

  const handleApproveMission = async () => {
    if (!selectedMission || approvalData.service_value <= 0) {
      showError('Erro', 'Informe um valor de serviço válido');
      return;
    }

    try {
      console.log('Aprovando missão:', selectedMission.id);

      const companyValue = (approvalData.service_value * approvalData.company_percentage) / 100;
      const providerValue = (approvalData.service_value * approvalData.provider_percentage) / 100;

      const updateData = {
        service_value: approvalData.service_value,
        company_percentage: approvalData.company_percentage,
        provider_percentage: approvalData.provider_percentage,
        company_value: companyValue,
        provider_value: providerValue,
        is_approved: true,
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      };

      const result = await updateMission(selectedMission.id, updateData);

      if (result.error) {
        console.error('Erro ao aprovar missão:', result.error);
        showError('Erro', result.error);
        return;
      }

      showSuccess('Sucesso', 'Missão aprovada! Receita registrada no sistema.');
      setShowApprovalModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao aprovar missão:', error);
      showError('Erro', 'Erro ao aprovar missão. Tente novamente.');
    }
  };

  const getStatusBadge = (status: string, isApproved: boolean = false) => {
    if (isApproved) {
      return <Badge className="bg-green-100 text-green-800">✓ Aprovada</Badge>;
    }
    
    const statusConfig = {
      planning: { label: 'Planejamento', className: 'bg-blue-100 text-blue-800' },
      'in-progress': { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getAssignedProvidersText = (assignedProviders: string[] | null) => {
    if (!assignedProviders || assignedProviders.length === 0) {
      return 'Nenhum prestador atribuído';
    }
    return `${assignedProviders.length} prestador(es) atribuído(s)`;
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
                    <Label htmlFor="client_name">Cliente</Label>
                    <ClientAutocomplete
                      value={formData.client_name}
                      onValueChange={(value) => setFormData({...formData, client_name: value})}
                      placeholder="Digite o nome do cliente"
                    />
                  </div>

                  <ServiceProviderSelector
                    selectedProviders={formData.assigned_providers}
                    onProvidersChange={(providers) => setFormData({...formData, assigned_providers: providers})}
                    label="Prestadores de Serviço *"
                  />

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Os valores da missão serão definidos pelo administrador durante a aprovação.
                    </p>
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
                        {getStatusBadge(mission.status, mission.is_approved)}
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

                        <p className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {getAssignedProvidersText(mission.assigned_providers)}
                        </p>
                        
                        {mission.service_value && mission.service_value > 0 && (
                          <div className="space-y-1">
                            <p className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Valor do Serviço: R$ {Number(mission.service_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            {mission.company_value && mission.provider_value && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="p-2 bg-blue-50 rounded text-xs">
                                  <div className="font-medium text-blue-800">Empresa ({mission.company_percentage}%)</div>
                                  <div className="text-blue-900">R$ {Number(mission.company_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded text-xs">
                                  <div className="font-medium text-green-800">Prestadores ({mission.provider_percentage}%)</div>
                                  <div className="text-green-900">R$ {Number(mission.provider_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {mission.description && (
                          <p className="mt-2 text-gray-700">{mission.description}</p>
                        )}

                        {mission.is_approved && mission.approved_at && (
                          <div className="pt-2 mt-2 border-t text-xs text-green-600">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Aprovada em {new Date(mission.approved_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Botão de aprovação APENAS para admins em missões sem valor */}
                      {userIsAdmin && !mission.is_approved && (
                        <Button 
                          onClick={() => handleApprovalModalOpen(mission)}
                          className="bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Definir Valores
                        </Button>
                      )}

                      {/* Menu de três pontos */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewMission(mission)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          {userIsAdmin && (
                            <DropdownMenuItem onClick={() => handleEditMission(mission)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <MissionViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        mission={selectedMission}
        onEdit={userIsAdmin ? handleEditMission : undefined}
      />

      {/* Modal de Edição */}
      <MissionEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        mission={selectedMission}
        onSave={(updatedMission) => {
          setShowEditModal(false);
          loadData();
        }}
      />

      {/* Modal de Aprovação/Definição de Valores */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Aprovar e Definir Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Missão: <strong>{selectedMission?.title}</strong>
              </p>
              
              <ServiceValueDistribution
                serviceValue={approvalData.service_value}
                companyPercentage={approvalData.company_percentage}
                onCompanyPercentageChange={(percentage) => 
                  setApprovalData(prev => ({
                    ...prev,
                    company_percentage: percentage,
                    provider_percentage: 100 - percentage
                  }))
                }
                onServiceValueChange={(value) => 
                  setApprovalData(prev => ({ ...prev, service_value: value }))
                }
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleApproveMission} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
