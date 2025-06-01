
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Mail, Phone, DollarSign } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ProviderViewModal } from './ProviderViewModal';
import { ProviderEditModal } from './ProviderEditModal';
import { NewProviderModal } from './NewProviderModal';
import { useFinancial } from '@/contexts/FinancialContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const ServiceProviders = () => {
  const { data } = useFinancial();
  const { showSuccess } = useToastFeedback();
  const { fetchServiceProviders } = useSupabaseData();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewProviderModalOpen, setIsNewProviderModalOpen] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const providersData = await fetchServiceProviders();
      setProviders(providersData);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  // Calcular saldos pendentes baseado nos pagamentos
  const getProviderBalance = (providerId: string) => {
    const providerPayments = data.payments.filter(p => 
      p.providerId === providerId && p.status === 'pending'
    );
    return providerPayments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getProviderTotalPaid = (providerId: string) => {
    const providerPayments = data.payments.filter(p => 
      p.providerId === providerId && p.status === 'completed'
    );
    return providerPayments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getProviderLastPayment = (providerId: string) => {
    const providerPayments = data.payments
      .filter(p => p.providerId === providerId && p.status === 'completed')
      .sort((a, b) => new Date(b.paymentDate || b.dueDate).getTime() - new Date(a.paymentDate || a.dueDate).getTime());
    
    return providerPayments.length > 0 ? providerPayments[0].paymentDate || providerPayments[0].dueDate : null;
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

  const handleViewClick = (provider: any) => {
    setSelectedProvider(provider);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (provider: any) => {
    setSelectedProvider(provider);
    setIsEditModalOpen(true);
  };

  const handlePaymentClick = (provider: any) => {
    setSelectedProvider(provider);
    setIsPaymentModalOpen(true);
  };

  const handleNewProvider = () => {
    setIsNewProviderModalOpen(true);
  };

  const handleSaveProvider = (updatedProvider: any) => {
    setProviders(prev => prev.map(p => 
      p.id === updatedProvider.id ? updatedProvider : p
    ));
    showSuccess('Sucesso', 'Prestador atualizado com sucesso!');
  };

  const handleAddProvider = (newProvider: any) => {
    setProviders(prev => [newProvider, ...prev]);
    showSuccess('Sucesso', 'Novo prestador adicionado com sucesso!');
    loadProviders(); // Recarregar para obter dados atualizados
  };

  const handleEditFromView = (provider: any) => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedProvider(provider);
      setIsEditModalOpen(true);
    }, 100);
  };

  const handlePayFromView = (provider: any) => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedProvider(provider);
      setIsPaymentModalOpen(true);
    }, 100);
  };

  const handleCloseModals = () => {
    setIsPaymentModalOpen(false);
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsNewProviderModalOpen(false);
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Prestadores de Serviço</h4>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleNewProvider}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Prestador
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead>Total Pago</TableHead>
              <TableHead>Saldo Pendente</TableHead>
              <TableHead>Último Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  Nenhum prestador de serviço encontrado. Adicione seu primeiro prestador!
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider) => {
                const pendingBalance = getProviderBalance(provider.id);
                const totalPaid = getProviderTotalPaid(provider.id);
                const lastPayment = getProviderLastPayment(provider.id);
                
                return (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{provider.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{provider.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{provider.service}</TableCell>
                    <TableCell>{getPaymentMethodLabel(provider.payment_method)}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {pendingBalance > 0 ? (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-600">
                            R$ {pendingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Em dia
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {lastPayment ? new Date(lastPayment).toLocaleDateString('pt-BR') : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.active ? 'default' : 'secondary'}>
                        {provider.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewClick(provider)}
                        >
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(provider)}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePaymentClick(provider)}
                        >
                          Pagar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Estatísticas dos Prestadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <h5 className="font-semibold text-slate-800 mb-2">Prestadores Ativos</h5>
          <p className="text-2xl font-bold text-blue-600">
            {providers.filter(p => p.active).length}
          </p>
        </Card>
        <Card className="p-4">
          <h5 className="font-semibold text-slate-800 mb-2">Total Pago (30 dias)</h5>
          <p className="text-2xl font-bold text-green-600">
            R$ {providers.reduce((sum, p) => sum + getProviderTotalPaid(p.id), 0).toLocaleString('pt-BR')}
          </p>
        </Card>
        <Card className="p-4">
          <h5 className="font-semibold text-slate-800 mb-2">Saldo Pendente</h5>
          <p className="text-2xl font-bold text-red-600">
            R$ {data.pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4">
          <h5 className="font-semibold text-slate-800 mb-2">Média por Prestador</h5>
          <p className="text-2xl font-bold text-purple-600">
            R$ {providers.length > 0 ? (providers.reduce((sum, p) => sum + getProviderTotalPaid(p.id), 0) / providers.length).toLocaleString('pt-BR') : '0'}
          </p>
        </Card>
      </div>

      {/* Modals */}
      <ProviderViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        provider={selectedProvider}
        onEdit={handleEditFromView}
        onPay={handlePayFromView}
      />

      <ProviderEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        provider={selectedProvider}
        onSave={handleSaveProvider}
      />

      <NewProviderModal
        isOpen={isNewProviderModalOpen}
        onClose={handleCloseModals}
        onSave={handleAddProvider}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModals}
        provider={selectedProvider}
      />
    </div>
  );
};
