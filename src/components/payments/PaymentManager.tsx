
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentList } from './PaymentList';
import { PaymentForm } from './PaymentForm';
import { ServiceProviders } from './ServiceProviders';
import { PaymentCalendar } from './PaymentCalendar';
import { ProviderBalanceManager } from './ProviderBalanceManager';
import { useAuth } from '@/contexts/AuthContext';
import { canCreatePayments } from '@/utils/authUtils';
import { ShieldX } from 'lucide-react';

export const PaymentManager = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('list');

  // Verificar permissões de acesso para aba de novo pagamento
  const canAccessNewPayment = canCreatePayments(profile);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gerenciador de Pagamentos</h3>
        <p className="text-slate-600 mb-6">
          Controle pagamentos a prestadores de serviço, incluindo pagamentos de saldo baseados em missões 
          e adiantamentos. Visualize o status de cada pagamento.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="list">Pagamentos</TabsTrigger>
            <TabsTrigger value="balances">Saldos</TabsTrigger>
            <TabsTrigger value="new" disabled={!canAccessNewPayment}>Novo Pagamento</TabsTrigger>
            <TabsTrigger value="providers">Prestadores</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <PaymentList />
          </TabsContent>

          <TabsContent value="balances" className="mt-6">
            <ProviderBalanceManager />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            {canAccessNewPayment ? (
              <PaymentForm />
            ) : (
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <ShieldX className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Acesso Restrito</h3>
                    <p className="text-red-600 mt-2">
                      Você não tem permissão para criar novos pagamentos.
                      Esta funcionalidade é restrita apenas para administradores.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="providers" className="mt-6">
            <ServiceProviders />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <PaymentCalendar />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
