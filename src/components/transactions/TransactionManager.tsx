
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from '@/components/auth/AuthContext';

export const TransactionManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Gerenciador de Transações
        </h3>
        <p className="text-slate-600 mb-6">
          {user?.role === 'owner' 
            ? 'Visualize e gerencie todas as transações da empresa, incluindo entradas via PIX, cartões de crédito e outras formas de pagamento.'
            : 'Registre suas despesas de viagem e visualize seus lançamentos.'
          }
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${user?.role === 'owner' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="list">Transações</TabsTrigger>
            <TabsTrigger value="new">Nova Transação</TabsTrigger>
            {user?.role === 'owner' && (
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <TransactionList />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <TransactionForm />
          </TabsContent>

          {user?.role === 'owner' && (
            <TabsContent value="categories" className="mt-6">
              <TransactionCategories />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
};
