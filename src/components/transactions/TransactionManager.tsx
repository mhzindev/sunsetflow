
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";

export const TransactionManager = () => {
  const { profile } = useAuth();
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
              {profile?.role === 'admin' 
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
          <TabsList className={`grid w-full ${profile?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="list">Transações</TabsTrigger>
            <TabsTrigger value="new">Nova Transação</TabsTrigger>
            {profile?.role === 'admin' && (
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <TransactionList 
              transactions={[]}
              onView={(id) => console.log('View transaction:', id)}
              onEdit={(id) => console.log('Edit transaction:', id)}
              onDelete={(id) => console.log('Delete transaction:', id)}
            />
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <TransactionForm onClose={handleTransactionSubmitted} />
          </TabsContent>

          {profile?.role === 'admin' && (
            <TabsContent value="categories" className="mt-6">
              <TransactionCategories />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
};
