import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { canManageProviders } from '@/utils/authUtils';
import { 
  Plus, 
  Edit, 
  Eye, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Briefcase,
  Settings,
  Key,
  Trash2,
  ShieldX
} from 'lucide-react';

export const ProviderManagement = () => {
  const { profile } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [providerAccess, setProviderAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProvider, setShowNewProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Verificar permissões de acesso
  if (!canManageProviders(profile)) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <ShieldX className="w-16 h-16 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Acesso Restrito</h3>
            <p className="text-red-600 mt-2">
              Você não tem permissão para acessar o gerenciamento de prestadores.
              Esta área é restrita apenas para administradores.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Formulário de novo prestador
  const [newProviderForm, setNewProviderForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    payment_method: 'pix' as any,
    cpf_cnpj: '',
    address: '',
    hourly_rate: ''
  });

  // Formulário de acesso
  const [accessForm, setAccessForm] = useState({
    access_email: '',
    password: '',
    permissions: {
      can_view_missions: true,
      can_create_expenses: true,
      can_update_missions: false
    }
  });

  const { 
    fetchServiceProviders, 
    fetchProviderAccess, 
    insertServiceProvider,
    insertServiceProviderWithAccess,
    deleteServiceProviderWithAccess 
  } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [providersData, accessData] = await Promise.all([
        fetchServiceProviders(),
        fetchProviderAccess()
      ]);
      setProviders(providersData || []);
      setProviderAccess(accessData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Erro ao carregar dados dos prestadores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProviderForm.name || !newProviderForm.email || !newProviderForm.phone || !newProviderForm.service) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsCreating(true);
    try {
      const providerData = {
        ...newProviderForm,
        hourly_rate: newProviderForm.hourly_rate ? parseFloat(newProviderForm.hourly_rate) : undefined
      };

      console.log('Criando prestador com dados:', providerData);
      const { data, error } = await insertServiceProvider(providerData);
      
      if (error) {
        console.error('Erro retornado:', error);
        showError('Erro', `Erro ao criar prestador: ${error}`);
        return;
      }

      if (data) {
        showSuccess('Sucesso', 'Prestador criado com sucesso!');
        setNewProviderForm({
          name: '',
          email: '',
          phone: '',
          service: '',
          payment_method: 'pix',
          cpf_cnpj: '',
          address: '',
          hourly_rate: ''
        });
        setShowNewProvider(false);
        await loadData();
      }
    } catch (error) {
      console.error('Erro inesperado ao criar prestador:', error);
      showError('Erro', 'Erro inesperado ao criar prestador');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !accessForm.access_email || !accessForm.password) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se o email de acesso é o mesmo do prestador
    if (accessForm.access_email !== selectedProvider.email) {
      showError('Erro', 'O email de acesso deve ser o mesmo email do prestador');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Criando acesso para prestador:', selectedProvider.id);
      const { data, error } = await insertServiceProviderWithAccess(
        selectedProvider,
        accessForm
      );
      
      if (error) {
        console.error('Erro ao criar acesso:', error);
        showError('Erro', `Erro ao criar acesso: ${error}`);
        return;
      }

      if (data?.access) {
        showSuccess('Sucesso', `Acesso criado! Código: ${data.access.access_code}`);
        setAccessForm({
          access_email: '',
          password: '',
          permissions: {
            can_view_missions: true,
            can_create_expenses: true,
            can_update_missions: false
          }
        });
        setShowAccessModal(false);
        setSelectedProvider(null);
        await loadData();
      }
    } catch (error) {
      console.error('Erro inesperado ao criar acesso:', error);
      showError('Erro', 'Erro inesperado ao criar acesso');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProvider = async (provider: any) => {
    const confirmText = `Tem certeza que deseja EXCLUIR PERMANENTEMENTE o prestador ${provider.name}? Esta ação irá remover o prestador e todos os seus acessos do sistema e não pode ser desfeita.`;
    
    if (window.confirm(confirmText)) {
      setIsCreating(true);
      try {
        const { data, error } = await deleteServiceProviderWithAccess(provider.id);
        
        if (error) {
          showError('Erro', `Erro ao excluir prestador: ${error}`);
          return;
        }

        if (data) {
          showSuccess('Sucesso', `Prestador ${provider.name} foi excluído permanentemente`);
          await loadData();
        }
      } catch (error) {
        console.error('Erro ao excluir prestador:', error);
        showError('Erro', 'Erro inesperado ao excluir prestador');
      } finally {
        setIsCreating(false);
      }
    }
  };

  // Helper functions
  function getProviderAccess(providerId: string) {
    return providerAccess.find(access => access.provider_id === providerId);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando prestadores...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold">Prestadores de Serviços</h4>
        <Button onClick={() => setShowNewProvider(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Prestador
        </Button>
      </div>

      {/* Lista de Prestadores */}
      <div className="grid gap-4">
        {providers.map((provider) => {
          const access = getProviderAccess(provider.id);
          
          return (
            <Card key={provider.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold text-lg">{provider.name}</h5>
                    {access ? (
                      <Badge className="bg-green-100 text-green-800">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Com Acesso
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <UserX className="w-3 h-3 mr-1" />
                        Sem Acesso
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{provider.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{provider.service}</span>
                    </div>
                    {provider.hourly_rate && (
                      <div className="flex items-center gap-2">
                        <span>Valor/hora: {formatCurrency(provider.hourly_rate)}</span>
                      </div>
                    )}
                  </div>

                  {access && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm">
                        <p><strong>Email de acesso:</strong> {access.email}</p>
                        <p><strong>Código:</strong> {access.access_code}</p>
                        <p><strong>Status:</strong> {access.is_active ? 'Ativo' : 'Inativo'}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProvider(provider);
                      setAccessForm(prev => ({
                        ...prev,
                        access_email: provider.email // Pré-preencher com o email do prestador
                      }));
                      setShowAccessModal(true);
                    }}
                    disabled={isCreating}
                  >
                    <Key className="w-4 h-4 mr-1" />
                    {access ? 'Recriar Acesso' : 'Criar Acesso'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteProvider(provider)}
                    disabled={isCreating}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Novo Prestador */}
      <Dialog open={showNewProvider} onOpenChange={setShowNewProvider}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Prestador de Serviços</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateProvider} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  value={newProviderForm.name}
                  onChange={(e) => setNewProviderForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  value={newProviderForm.email}
                  onChange={(e) => setNewProviderForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  value={newProviderForm.phone}
                  onChange={(e) => setNewProviderForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input
                  value={newProviderForm.cpf_cnpj}
                  onChange={(e) => setNewProviderForm(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label htmlFor="service">Serviço *</Label>
                <Input
                  value={newProviderForm.service}
                  onChange={(e) => setNewProviderForm(prev => ({ ...prev, service: e.target.value }))}
                  placeholder="Ex: Instalação de rastreadores"
                  required
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate">Valor por Hora</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProviderForm.hourly_rate}
                  onChange={(e) => setNewProviderForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="payment_method">Método de Pagamento *</Label>
                <Select 
                  value={newProviderForm.payment_method} 
                  onValueChange={(value) => 
                    setNewProviderForm(prev => ({ ...prev, payment_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                value={newProviderForm.address}
                onChange={(e) => setNewProviderForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Endereço completo"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating ? 'Criando...' : 'Criar Prestador'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewProvider(false)}
                className="flex-1"
                disabled={isCreating}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Criar Acesso */}
      <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Acesso para {selectedProvider?.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateAccess} className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> O email de acesso deve ser o mesmo email do prestador para garantir a autenticação correta.
              </p>
            </div>

            <div>
              <Label htmlFor="access_email">Email de Acesso *</Label>
              <Input
                type="email"
                value={accessForm.access_email}
                onChange={(e) => setAccessForm(prev => ({ ...prev, access_email: e.target.value }))}
                placeholder="Deve ser igual ao email do prestador"
                required
              />
              {selectedProvider && accessForm.access_email !== selectedProvider.email && (
                <p className="text-sm text-red-600 mt-1">
                  Email deve ser: {selectedProvider.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Senha Temporária *</Label>
              <Input
                type="password"
                value={accessForm.password}
                onChange={(e) => setAccessForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Senha forte"
                required
              />
            </div>

            <div>
              <Label>Permissões</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_view_missions"
                    checked={accessForm.permissions.can_view_missions}
                    onCheckedChange={(checked) => 
                      setAccessForm(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          can_view_missions: checked as boolean
                        }
                      }))
                    }
                  />
                  <Label htmlFor="can_view_missions">Visualizar Missões</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_create_expenses"
                    checked={accessForm.permissions.can_create_expenses}
                    onCheckedChange={(checked) => 
                      setAccessForm(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          can_create_expenses: checked as boolean
                        }
                      }))
                    }
                  />
                  <Label htmlFor="can_create_expenses">Criar Despesas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_update_missions"
                    checked={accessForm.permissions.can_update_missions}
                    onCheckedChange={(checked) => 
                      setAccessForm(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          can_update_missions: checked as boolean
                        }
                      }))
                    }
                  />
                  <Label htmlFor="can_update_missions">Atualizar Missões</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isCreating || (selectedProvider && accessForm.access_email !== selectedProvider.email)}
              >
                {isCreating ? 'Criando...' : 'Criar Acesso'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAccessModal(false)}
                className="flex-1"
                disabled={isCreating}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
