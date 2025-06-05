
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { MissionManager } from './MissionManager';
import { ExpensesByEmployee } from './ExpensesByEmployee';
import { ExpensesByMission } from './ExpensesByMission';
import { ProviderExpensesList } from './ProviderExpensesList';
import { ProviderMissionPanel } from './ProviderMissionPanel';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseManagerProps {
  onNavigate?: (section: string) => void;
}

export const ExpenseManager = ({ onNavigate }: ExpenseManagerProps) => {
  const [activeTab, setActiveTab] = useState('new-expense');
  const { showSuccess } = useToastFeedback();
  const { profile } = useAuth();
  
  // Verificar se é prestador
  const isProvider = profile?.user_type === 'provider';

  const handleExpenseSubmitted = () => {
    showSuccess('Despesa Registrada', 'A despesa foi registrada com sucesso!');
    setActiveTab('expenses');
  };

  const handleMissionCreated = () => {
    showSuccess('Missão Criada', 'A missão foi criada com sucesso!');
    setActiveTab('missions');
  };

  // Se for prestador, mostrar interface para prestadores
  if (isProvider) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Painel do Prestador
          </h3>
          <p className="text-slate-600 mb-6">
            Gerencie suas missões e despesas de viagem para instalação e manutenção de rastreadores.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new-expense">Nova Despesa</TabsTrigger>
              <TabsTrigger value="my-expenses">Minhas Despesas</TabsTrigger>
              <TabsTrigger value="my-missions">Minhas Missões</TabsTrigger>
            </TabsList>

            <TabsContent value="new-expense" className="mt-6">
              <ExpenseForm 
                onSave={handleExpenseSubmitted} 
                onCancel={() => setActiveTab('my-expenses')} 
              />
            </TabsContent>

            <TabsContent value="my-expenses" className="mt-6">
              <ProviderExpensesList />
            </TabsContent>

            <TabsContent value="my-missions" className="mt-6">
              <ProviderMissionPanel />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  // Interface completa para administradores
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
            <ExpenseForm 
              onSave={handleExpenseSubmitted} 
              onCancel={() => setActiveTab('expenses')} 
            />
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
            <MissionManager onMissionCreated={handleMissionCreated} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
