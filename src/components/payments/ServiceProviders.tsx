
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { NewProviderModal } from './NewProviderModal';
import { ProviderViewModal } from './ProviderViewModal';
import { ProviderEditModal } from './ProviderEditModal';
import { Plus, Search, Eye, Edit, RefreshCw } from 'lucide-react';

export const ServiceProviders = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const { fetchServiceProviders } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      console.log('Carregando prestadores de serviço...');
      const data = await fetchServiceProviders();
      console.log('Prestadores carregados:', data);
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
      showError('Erro', 'Não foi possível carregar os prestadores de serviço');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadProviders();
  };

  const handleNewProvider = () => {
    setIsNewModalOpen(true);
  };

  const handleViewProvider = (provider: any) => {
    setSelectedProvider(provider);
    setIsViewModalOpen(true);
  };

  const handleEditProvider = (provider: any) => {
    setSelectedProvider(provider);
    setIsEditModalOpen(true);
  };

  const handleProviderCreated = () => {
    setIsNewModalOpen(false);
    loadProviders();
    showSuccess('Sucesso', 'Prestador criado com sucesso!');
  };

  const handleProviderUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedProvider(null);
    loadProviders();
    showSuccess('Sucesso', 'Prestador atualizado com sucesso!');
  };

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando prestadores...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Prestadores de Serviço ({providers.length})</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={handleNewProvider}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Prestador
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, serviço ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {providers.length === 0 
                  ? 'Nenhum prestador cadastrado ainda'
                  : 'Nenhum prestador encontrado com os filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{provider.name}</h3>
                        <Badge variant="outline">
                          {provider.service}
                        </Badge>
                        {provider.has_system_access && (
                          <Badge variant="secondary">
                            Acesso ao Sistema
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Email:</strong> {provider.email}</p>
                        <p><strong>Telefone:</strong> {provider.phone}</p>
                        {provider.cpf_cnpj && (
                          <p><strong>CPF/CNPJ:</strong> {provider.cpf_cnpj}</p>
                        )}
                        {provider.hourly_rate && (
                          <p><strong>Valor/Hora:</strong> R$ {Number(provider.hourly_rate).toFixed(2)}</p>
                        )}
                        <p><strong>Pagamento:</strong> {provider.payment_method}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProvider(provider)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewProviderModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleProviderCreated}
      />

      <ProviderViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        provider={selectedProvider}
        onEdit={() => {
          setIsViewModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <ProviderEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        provider={selectedProvider}
        onSuccess={handleProviderUpdated}
      />
    </div>
  );
};
