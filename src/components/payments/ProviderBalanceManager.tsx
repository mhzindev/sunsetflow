
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentModal } from './PaymentModal';
import { ProviderBalanceDetails } from '@/components/providers/ProviderBalanceDetails';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/payment';
import { Eye, RefreshCw } from 'lucide-react';

export const ProviderBalanceManager = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'balance_payment' | 'advance_payment'>('balance_payment');
  const [loading, setLoading] = useState(true);

  const { fetchServiceProviders } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceProviders();
      console.log('Prestadores carregados:', data);
      setProviders(data);
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
      showError('Erro', 'Erro ao carregar prestadores');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowDetailsModal(true);
  };

  const handlePayBalance = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setPaymentType('balance_payment');
    setShowPaymentModal(true);
  };

  const handleAdvancePayment = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setPaymentType('advance_payment');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedProvider(null);
    loadProviders(); // Recarregar para atualizar os saldos
    showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
  };

  const handleRecalculateAll = async () => {
    try {
      setLoading(true);
      
      // Recalcular saldo de todos os prestadores
      for (const provider of providers) {
        await supabase.rpc('recalculate_provider_balance', {
          provider_uuid: provider.id
        });
      }
      
      await loadProviders();
      showSuccess('Sucesso', 'Saldos recalculados para todos os prestadores');
    } catch (error) {
      console.error('Erro ao recalcular saldos:', error);
      showError('Erro', 'Erro ao recalcular saldos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'bg-green-100 text-green-800';
    if (balance < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

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
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Saldos dos Prestadores
            </h3>
            <p className="text-slate-600">
              Gerencie os saldos baseados em missões aprovadas e pagamentos efetuados.
            </p>
          </div>
          <Button 
            onClick={handleRecalculateAll}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalcular Todos
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prestador</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Saldo Atual</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-gray-500">{provider.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{provider.service}</TableCell>
                  <TableCell>
                    <Badge className={getBalanceColor(provider.currentBalance || 0)}>
                      {formatCurrency(provider.currentBalance || 0)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(provider)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                      
                      {(provider.currentBalance || 0) > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handlePayBalance(provider)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Pagar Saldo
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAdvancePayment(provider)}
                      >
                        Adiantamento
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {providers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum prestador cadastrado
          </div>
        )}
      </Card>

      {/* Modal de Detalhes do Saldo */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Saldo</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <ProviderBalanceDetails
              providerId={selectedProvider.id}
              providerName={selectedProvider.name}
              currentBalance={selectedProvider.currentBalance || 0}
              onRecalculate={loadProviders}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Pagamento */}
      {selectedProvider && (
        <PaymentModal
          isOpen={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          provider={selectedProvider}
          paymentType={paymentType}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
