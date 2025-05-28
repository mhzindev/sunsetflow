
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { MissionManager } from './MissionManager';
import { ExpensesByEmployee } from './ExpensesByEmployee';
import { ExpensesByMission } from './ExpensesByMission';

export const ExpenseManager = () => {
  const [activeTab, setActiveTab] = useState('new-expense');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Gerenciamento de Despesas de Viagem
        </h3>
        <p className="text-slate-600 mb-6">
          Controle de despesas de viagem para instalação e manutenção de rastreadores,
          organizadas por funcionário e missão.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="new-expense">Nova Despesa</TabsTrigger>
            <TabsTrigger value="expenses">Todas as Despesas</TabsTrigger>
            <TabsTrigger value="by-employee">Por Funcionário</TabsTrigger>
            <TabsTrigger value="by-mission">Por Missão</TabsTrigger>
            <TabsTrigger value="missions">Missões</TabsTrigger>
          </TabsList>

          <TabsContent value="new-expense" className="mt-6">
            <ExpenseForm />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpenseList />
          </TabsContent>

          <TabsContent value="by-employee" className="mt-6">
            <ExpensesByEmployee />
          </TabsContent>

          <TabsContent value="by-mission" className="mt-6">
            <ExpensesByMission />
          </TabsContent>

          <TabsContent value="missions" className="mt-6">
            <MissionManager />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
