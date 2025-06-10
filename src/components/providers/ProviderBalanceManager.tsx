import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentModal } from './PaymentModal';
import { ProviderBalanceDetailsEnhanced } from '@/components/providers/ProviderBalanceDetailsEnhanced';
import { ProviderBalanceManagerRow } from './ProviderBalanceManagerRow';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '@/types/payment';
import { RefreshCw, Info } from 'lucide-react';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';

export const ProviderBalanceManager = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'balance_payment' | 'advance_payment'>('balance_payment');
  const [loading, setLoading] = useState(true);

  const { fetchServiceProviders } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();
  const { isValidated, companyId } = useCompanyIsolation();

  useEffect(() => {
    if (isValidated && companyId) {
      loadProviders();
    }
  }, [isValidated, companyId]);

  const loadProviders = async () => {
    if (!companyId) {
      setProviders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar apenas prestadores da empresa atual
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;

      console.log('Prestadores da empresa carregados:', data);
      setProviders(data || []);
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
    showSuccess('Sucesso', 'Pagamento registrado com sucesso! Os pagamentos pendentes foram automaticamente liquidados.');
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

  if (!isValidated || !companyId) {
    return (
      <Card className="p-6">
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            Acesso restrito: Sua conta não está associada a nenhuma empresa.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

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

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Liquidação Automática:</strong> Quando você realizar um pagamento de saldo, 
            todos os pagamentos pendentes relacionados serão automaticamente marcados como concluídos. 
            Use o botão "Liquidar" para processar manualmente se necessário.
          </AlertDescription>
        </Alert>

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
                <ProviderBalanceManagerRow
                  key={provider.id}
                  provider={provider}
                  onViewDetails={handleViewDetails}
                  onPayBalance={handlePayBalance}
                  onAdvancePayment={handleAdvancePayment}
                  onRefresh={loadProviders}
                />
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
            <ProviderBalanceDetailsEnhanced
              providerId={selectedProvider.id}
              providerName={selectedProvider.name}
              currentBalance={selectedProvider.currentBalance || 0}
              onRecalculate={loadProviders}
              isProvider={false}
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
