
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, Plus, Calendar, MapPin, Users, DollarSign, Eye, Clock, TrendingUp } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { getCurrentDateForInput } from '@/utils/dateUtils';
import { useProviderBalanceDetails } from '@/hooks/useProviderBalanceDetails';

export const ProviderMissionPanel = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: getCurrentDateForInput(),
    end_date: '',
    service_value: 0,
    client_name: '',
    status: 'planning'
  });

  const { fetchMissions, insertMission } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();
  const { user, profile } = useAuth();
  const { balanceDetails, loading: balanceLoading } = useProviderBalanceDetails(profile?.provider_id || '');

  useEffect(() => {
    if (user && profile?.user_type === 'provider') {
      loadProviderMissions();
    }
  }, [user, profile]);

  const loadProviderMissions = async () => {
    try {
      setLoading(true);
      console.log('Carregando missões para prestador:', profile?.provider_id);
      console.log('User ID:', user?.id);
      
      const missionsData = await fetchMissions();
      console.log('Todas as missões retornadas:', missionsData);
      
      // Filtrar missões onde o prestador está vinculado
      const providerMissions = missionsData.filter((mission: any) => {
        const isAssigned = mission.assigned_providers && 
          Array.isArray(mission.assigned_providers) && 
          mission.assigned_providers.includes(profile?.provider_id);
        
        const isMainProvider = mission.provider_id === profile?.provider_id;
        
        console.log(`Missão ${mission.title}:`, {
          assigned_providers: mission.assigned_providers,
          provider_id: mission.provider_id,
          current_provider_id: profile?.provider_id,
          isAssigned,
          isMainProvider
        });
        
        return isAssigned || isMainProvider;
      });
      
      console.log('Missões filtradas para o prestador:', providerMissions);
      setMissions(providerMissions || []);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
      showError('Erro', 'Não foi possível carregar as missões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.location.trim() || !formData.start_date) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const missionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        service_value: formData.service_value || null,
        client_name: formData.client_name,
        assigned_providers: [profile?.provider_id], // Auto-atribuir ao prestador atual
        status: 'planning',
        is_approved: false,
        created_by: user?.id
      };

      console.log('Criando missão como prestador:', missionData);

      const result = await insertMission(missionData);
      
      if (result.error) {
        console.error('Erro ao criar missão:', result.error);
        showError('Erro', result.error);
        return;
      }

      showSuccess('Sucesso', 'Missão criada! Aguardando aprovação do administrador.');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        start_date: getCurrentDateForInput(),
        end_date: '',
        service_value: 0,
        client_name: '',
        status: 'planning'
      });
      loadProviderMissions();
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      showError('Erro', 'Erro ao criar missão. Tente novamente.');
    }
  };

  // Calcular valor que o prestador receberá
  const calculateProviderEarning = (mission: any) => {
    if (!mission.is_approved || !mission.provider_value) return 0;
    
    const isMainProvider = mission.provider_id === profile?.provider_id;
    const isAssignedProvider = mission.assigned_providers?.includes(profile?.provider_id);
    
    if (isMainProvider) {
      return mission.provider_value;
    } else if (isAssignedProvider && mission.assigned_providers?.length > 0) {
      return mission.provider_value / mission.assigned_providers.length;
    }
    
    return 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredMissions = missions.filter(mission => {
    if (!searchTerm) return true;
    return mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mission.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (mission.client_name && mission.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getStatusBadge = (mission: any) => {
    if (!mission.is_approved) {
      return <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Aguardando Aprovação
      </Badge>;
    }
    
    const statusConfig = {
      planning: { label: 'Planejamento', className: 'bg-blue-100 text-blue-800' },
      'in-progress': { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[mission.status as keyof typeof statusConfig] || statusConfig.planning;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading || balanceLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando suas missões...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Saldo Atual</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(balanceDetails.currentBalance)}
              </p>
              <p className="text-xs text-green-700">
                Disponível para saque
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Saldo Pendente</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(balanceDetails.pendingBalance)}
              </p>
              <p className="text-xs text-blue-700">
                Aguardando pagamento do cliente
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Minhas Missões</h4>
            <p className="text-sm text-gray-600 mt-1">
              Missões onde você está designado ({filteredMissions.length})
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadProviderMissions} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Missão
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6 p-4 border-dashed">
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
                  <Label htmlFor="service_value">Valor do Serviço (R$)</Label>
                  <Input
                    id="service_value"
                    type="number"
                    step="0.01"
                    value={formData.service_value}
                    onChange={(e) => setFormData({...formData, service_value: parseFloat(e.target.value) || 0})}
                  />
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
          </Card>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar missões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredMissions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma missão encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {missions.length === 0 ? 
                'Você ainda não tem missões atribuídas. Crie sua primeira missão.' :
                'Nenhuma missão encontrada com o termo de busca.'
              }
            </p>
            {missions.length === 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Missão
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Missão</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Meu Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{mission.title}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {mission.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {mission.client_name || 'Não informado'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(mission.start_date).toLocaleDateString('pt-BR')}</div>
                      {mission.end_date && (
                        <div className="text-gray-500">
                          até {new Date(mission.end_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mission.is_approved ? (
                      <div className="text-sm">
                        <div className="font-medium text-green-600">
                          R$ {Number(calculateProviderEarning(mission)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mission.provider_id === profile?.provider_id ? 'Prestador Principal' : 'Prestador Designado'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Aguardando aprovação</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(mission)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
