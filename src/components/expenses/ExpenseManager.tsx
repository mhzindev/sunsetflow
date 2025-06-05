import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm';
import { useAuth } from "@/contexts/AuthContext";
import { ProviderExpensesList } from './ProviderExpensesList';

interface ExpenseManagerProps {
  onNavigate: (section: string) => void;
}

export const ExpenseManager = ({ onNavigate }: ExpenseManagerProps) => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'admin' || profile?.user_type === 'admin';
  const isProvider = profile?.user_type === 'provider';

  const [activeTab, setActiveTab] = useState('list');

  // Se for prestador, mostrar interface simplificada com lista personalizada
  if (isProvider) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Minhas Despesas</h1>
            <p className="text-slate-600 mt-2">
              Gerencie suas despesas de viagem e acompanhe suas receitas de deslocamento e hospedagem.
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Minhas Despesas</TabsTrigger>
            <TabsTrigger value="new">Nova Despesa</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <ProviderExpensesList />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <ExpenseForm onSave={() => setActiveTab('list')} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Interface completa para donos da empresa
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Despesas</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Despesas</TabsTrigger>
          <TabsTrigger value="new">Nova Despesa</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ExpenseList />
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <ExpenseForm onSave={() => setActiveTab('list')} onCancel={() => setActiveTab('list')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
