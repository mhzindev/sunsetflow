
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseDataSecure } from '@/hooks/useSupabaseDataSecure';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Plus, Search, Eye, Edit, RefreshCw, Shield, Building2 } from 'lucide-react';

export const ProviderManagementSecure = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchServiceProviders, loading } = useSupabaseDataSecure();
  const { isValidated, hasCompanyAccess, companyId } = useCompanyIsolation();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadProviders();
  }, [isValidated, companyId]);

  const loadProviders = async () => {
    if (!isValidated || !companyId) {
      console.log('🔒 ProviderManagementSecure: Aguardando validação de empresa');
      return;
    }

    try {
      console.log('🏢 ProviderManagementSecure: Carregando prestadores para empresa:', companyId);
      const data = await fetchServiceProviders();
      console.log('✅ Prestadores isolados carregados:', data?.length || 0);
      setProviders(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar prestadores:', error);
      showError('Erro', 'Não foi possível carregar os prestadores de serviço');
      setProviders([]);
    }
  };

  const handleRefresh = () => {
    loadProviders();
  };

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasCompanyAccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <Building2 className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Acesso Restrito:</strong> Sua conta não está associada a nenhuma empresa. 
            Entre em contato com o administrador para obter acesso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando prestadores isolados...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">
            <strong>Isolamento Ativo:</strong> Exibindo apenas prestadores da sua empresa ({filteredProviders.length} registros)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              Prestadores de Serviço 
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-normal text-muted-foreground">
                ({providers.length} da empresa)
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button>
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
                  ? 'Nenhum prestador cadastrado ainda para esta empresa'
                  : 'Nenhum prestador encontrado com os filtros aplicados'
                }
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Os prestadores são isolados por empresa
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
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
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Isolado
                        </Badge>
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
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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
    </div>
  );
};
