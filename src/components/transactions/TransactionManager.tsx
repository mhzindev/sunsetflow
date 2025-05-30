
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from '@/components/auth/AuthContext';

export const TransactionManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');

  const handleNewTransaction = () => {
    setActiveTab('new');
  };

  const handleTransactionSubmitted = () => {
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Gerenciador de Transações
            </h3>
            <p className="text-slate-600">
              {user?.role === 'owner' 
                ? 'Visualize e gerencie todas as transações da empresa, incluindo entradas via PIX, cartões de crédito e outras formas de pagamento.'
                : 'Registre suas despesas de viagem e visualize seus lançamentos.'
              }
            </p>
          </div>
          <Button 
            onClick={handleNewTransaction}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

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
            <TransactionForm onTransactionSubmitted={handleTransactionSubmitted} />
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
