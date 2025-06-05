
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentModal } from './PaymentModal';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { ServiceProvider } from '@/types/payment';

export const ProviderBalanceManager = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
      setProviders(data);
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
      showError('Erro', 'Erro ao carregar prestadores');
    } finally {
      setLoading(false);
    }
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
        <div className="text-center">Carregando prestadores...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Saldos dos Prestadores
        </h3>
        <p className="text-slate-600 mb-6">
          Gerencie os saldos baseados em missões aprovadas e pagamentos efetuados.
        </p>

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
