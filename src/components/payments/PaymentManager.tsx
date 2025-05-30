
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentList } from './PaymentList';
import { PaymentForm } from './PaymentForm';
import { ServiceProviders } from './ServiceProviders';
import { PaymentCalendar } from './PaymentCalendar';

export const PaymentManager = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gerenciador de Pagamentos</h3>
        <p className="text-slate-600 mb-6">
          Controle pagamentos a prestadores de serviço, incluindo pagamentos parciais, 
          antecipados e com atraso. Visualize o status de cada pagamento.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Pagamentos</TabsTrigger>
            <TabsTrigger value="new">Novo Pagamento</TabsTrigger>
            <TabsTrigger value="providers">Prestadores</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <PaymentList />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <PaymentForm />
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
