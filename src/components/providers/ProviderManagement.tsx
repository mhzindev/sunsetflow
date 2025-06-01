
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Key, Edit, Eye, Shield, ShieldCheck } from 'lucide-react';
import { ProviderAccessModal } from './ProviderAccessModal';
import { NewProviderModal } from '../payments/NewProviderModal';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const ProviderManagement = () => {
  const { fetchServiceProviders } = useSupabaseData();
  const { showSuccess } = useToastFeedback();
  
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isNewProviderModalOpen, setIsNewProviderModalOpen] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    const filtered = providers.filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [providers, searchTerm]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceProviders();
      setProviders(data);
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccess = (provider: any) => {
    setSelectedProvider(provider);
    setIsAccessModalOpen(true);
  };

  const handleNewProvider = () => {
    setIsNewProviderModalOpen(true);
  };

  const handleProviderAdded = (newProvider: any) => {
    setProviders(prev => [newProvider, ...prev]);
    showSuccess('Sucesso', 'Novo prestador adicionado com sucesso!');
  };

  const handleAccessCreated = () => {
    // Atualizar lista de prestadores
    loadProviders();
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      pix: 'PIX',
      transfer: 'Transferência',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro'
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando prestadores...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Gestão de Prestadores</h4>
            <p className="text-slate-600">Gerencie prestadores de serviço e seus acessos ao sistema</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleNewProvider}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Prestador
          </Button>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de Prestadores</p>
                <p className="text-2xl font-bold text-blue-600">{providers.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Com Acesso ao Sistema</p>
                <p className="text-2xl font-bold text-green-600">
                  {providers.filter(p => p.has_system_access).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ativos</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {providers.filter(p => p.active).length}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Especialidades</p>
                <p className="text-2xl font-bold text-purple-600">
                  {[...new Set(providers.flatMap(p => p.specialties || []))].length}
                </p>
              </div>
              <Key className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Tabela de Prestadores */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prestador</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Valor/Hora</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Acesso Sistema</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    {searchTerm ? 'Nenhum prestador encontrado com esse termo de busca' : 'Nenhum prestador cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        {provider.cpf_cnpj && (
                          <div className="text-sm text-gray-500">{provider.cpf_cnpj}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{provider.email}</div>
                        <div className="text-sm text-gray-500">{provider.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{provider.service}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(provider.specialties || []).slice(0, 2).map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {(provider.specialties || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(provider.specialties || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider.hourly_rate ? (
                        <span className="font-medium">
                          R$ {provider.hourly_rate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-400">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodLabel(provider.payment_method)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {provider.has_system_access ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Sem acesso
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.active ? 'default' : 'secondary'}>
                        {provider.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        {!provider.has_system_access && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleCreateAccess(provider)}
                          >
                            <Key className="w-3 h-3 mr-1" />
                            Acesso
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      <ProviderAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        provider={selectedProvider}
        onSuccess={handleAccessCreated}
      />

      <NewProviderModal
        isOpen={isNewProviderModalOpen}
        onClose={() => setIsNewProviderModalOpen(false)}
        onSave={handleProviderAdded}
      />
    </div>
  );
};
