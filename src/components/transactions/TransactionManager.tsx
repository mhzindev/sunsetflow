
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from "@/contexts/AuthContext";
import { useFinancial } from "@/contexts/FinancialContext";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TransactionManager = () => {
  const { profile } = useAuth();
  const { data, loading, error, refreshData } = useFinancial();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');

  const handleNewTransaction = () => {
    setActiveTab('new');
  };

  const handleTransactionSubmitted = () => {
    setActiveTab('list');
    toast({
      title: "Transação criada",
      description: "A transação foi registrada com sucesso.",
    });
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      toast({
        title: "Dados atualizados",
        description: "As transações foram recarregadas.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive"
      });
    }
  };

  const handleViewTransaction = (id: string) => {
    console.log('View transaction:', id);
    // TODO: Implementar modal de visualização
  };

  const handleEditTransaction = (id: string) => {
    console.log('Edit transaction:', id);
    // TODO: Implementar modal de edição
  };

  const handleDeleteTransaction = (id: string) => {
    console.log('Delete transaction:', id);
    // TODO: Implementar exclusão
  };

  // Mapear transações para o formato esperado pelo TransactionList
  const mappedTransactions = data.transactions.map(t => ({
    id: t.id,
    type: t.type,
    description: t.description,
    amount: t.amount,
    category: t.category,
    paymentMethod: t.method,
    date: t.date,
    status: t.status as 'pending' | 'completed' | 'cancelled',
    employeeName: t.userName
  }));

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

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
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              onClick={handleNewTransaction}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${profile?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="list">
              Transações ({data.transactions.length})
            </TabsTrigger>
            <TabsTrigger value="new">Nova Transação</TabsTrigger>
            {profile?.role === 'admin' && (
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <TransactionList 
              transactions={mappedTransactions}
              onView={handleViewTransaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
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
