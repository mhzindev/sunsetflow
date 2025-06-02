
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TransactionManager = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchTransactions } = useSupabaseData();

  const loadTransactions = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando carregamento de transações...');
      const data = await fetchTransactions();
      
      if (Array.isArray(data)) {
        setTransactions(data);
        console.log(`${data.length} transações carregadas com sucesso`);
        
        if (showToast && data.length > 0) {
          toast({
            title: "Transações carregadas",
            description: `${data.length} transações encontradas.`,
          });
        }
      } else {
        console.warn('Dados retornados não são um array:', data);
        setTransactions([]);
      }
    } catch (err: any) {
      console.error('Erro ao carregar transações:', err);
      const errorMessage = err?.message || 'Erro desconhecido ao carregar transações';
      setError(errorMessage);
      setTransactions([]);
      
      if (showToast) {
        toast({
          title: "Erro ao carregar",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleNewTransaction = () => {
    setActiveTab('new');
  };

  const handleTransactionSubmitted = async () => {
    setActiveTab('list');
    await loadTransactions(true);
    toast({
      title: "Transação criada",
      description: "A transação foi registrada com sucesso.",
    });
  };

  const handleRefresh = async () => {
    await loadTransactions(true);
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
  const mappedTransactions = transactions.map(t => ({
    id: t.id,
    type: t.type,
    description: t.description,
    amount: t.amount,
    category: t.category,
    paymentMethod: t.method,
    date: t.date,
    status: t.status as 'pending' | 'completed' | 'cancelled',
    employeeName: t.user_name,
    receipt: t.receipt,
    tags: t.tags,
    method: t.method
  }));

  if (error && !loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Erro ao carregar transações
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => loadTransactions(true)} variant="outline">
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
            <p className="text-sm text-slate-500 mt-1">
              Total de transações carregadas: {mappedTransactions.length}
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
              Transações ({mappedTransactions.length})
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
