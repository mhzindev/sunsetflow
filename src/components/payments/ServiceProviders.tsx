
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Mail, Phone, DollarSign } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { useFinancial } from '@/contexts/FinancialContext';

export const ServiceProviders = () => {
  const { data } = useFinancial();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const mockProviders = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-1111',
      service: 'Técnico de Instalação',
      paymentMethod: 'pix' as const,
      active: true,
      totalPaid: 15000.00,
      lastPayment: '2024-01-15'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 99999-2222',
      service: 'Técnica de Manutenção',
      paymentMethod: 'transfer' as const,
      active: true,
      totalPaid: 12000.00,
      lastPayment: '2024-01-10'
    },
    {
      id: '3',
      name: 'Tech Solutions Ltd',
      email: 'contato@techsolutions.com',
      phone: '(11) 3333-4444',
      service: 'Desenvolvimento de Software',
      paymentMethod: 'transfer' as const,
      active: true,
      totalPaid: 8500.00,
      lastPayment: '2024-01-05'
    },
    {
      id: '4',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '(11) 99999-3333',
      service: 'Freelancer - Suporte Técnico',
      paymentMethod: 'pix' as const,
      active: false,
      totalPaid: 3500.00,
      lastPayment: '2023-12-20'
    }
  ];

  // Calcular saldos pendentes baseado nos pagamentos
  const getProviderBalance = (providerId: string) => {
    const providerPayments = data.payments.filter(p => 
      p.providerId === providerId && p.status === 'pending'
    );
    return providerPayments.reduce((sum, p) => sum + p.amount, 0);
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

  const handlePaymentClick = (provider: any) => {
    setSelectedProvider(provider);
    setIsPaymentModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedProvider(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Prestadores de Serviço</h4>
          <Button className="bg-blue-600 hover:bg-blue-700">
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
            {mockProviders.map((provider) => {
              const pendingBalance = getProviderBalance(provider.id);
              
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
                  <TableCell>{getPaymentMethodLabel(provider.paymentMethod)}</TableCell>
                  <TableCell className="font-semibold">
                    R$ {provider.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <TableCell>{new Date(provider.lastPayment).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={provider.active ? 'default' : 'secondary'}>
                      {provider.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">Ver</Button>
                      <Button variant="outline" size="sm">Editar</Button>
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
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Estatísticas dos Prestadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <h5 className="font-semibold text-slate-800 mb-2">Prestadores Ativos</h5>
          <p className="text-2xl font-bold text-blue-600">
            {mockProviders.filter(p => p.active).length}
          </p>
        </Card>
        <Card className="p-4">
          <h5 className="font-semibold text-slate-800 mb-2">Total Pago (30 dias)</h5>
          <p className="text-2xl font-bold text-green-600">
            R$ {mockProviders.reduce((sum, p) => sum + p.totalPaid, 0).toLocaleString('pt-BR')}
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
            R$ {(mockProviders.reduce((sum, p) => sum + p.totalPaid, 0) / mockProviders.length).toLocaleString('pt-BR')}
          </p>
        </Card>
      </div>

      {/* Modal de Pagamento */}
      {selectedProvider && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleCloseModal}
          provider={selectedProvider}
        />
      )}
    </div>
  );
};
