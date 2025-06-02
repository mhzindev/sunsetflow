
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, RefreshCw, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TransactionManager = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { fetchTransactions } = useSupabaseData();

  const loadTransactions = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('');
      
      console.log('=== DEBUG: Iniciando carregamento de transações ===');
      console.log('User ID:', user?.id);
      console.log('User email:', user?.email);
      console.log('Profile:', profile);
      
      const data = await fetchTransactions();
      
      console.log('=== DEBUG: Dados retornados ===');
      console.log('Tipo dos dados:', typeof data);
      console.log('É array?', Array.isArray(data));
      console.log('Quantidade de items:', data?.length);
      console.log('Primeiros 3 items:', data?.slice(0, 3));
      
      if (Array.isArray(data)) {
        setTransactions(data);
        setDebugInfo(`Carregados ${data.length} registros do banco de dados`);
        
        if (showToast) {
          toast({
            title: "Transações atualizadas",
            description: `${data.length} transações carregadas com sucesso.`,
          });
        }
      } else {
        console.warn('Dados retornados não são um array:', data);
        setTransactions([]);
        setDebugInfo('Dados retornados não são um array válido');
      }
    } catch (err: any) {
      console.error('=== DEBUG: Erro ao carregar transações ===', err);
      const errorMessage = err?.message || 'Erro desconhecido ao carregar transações';
      setError(errorMessage);
      setTransactions([]);
      setDebugInfo(`Erro: ${errorMessage}`);
      
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
    console.log('=== DEBUG: useEffect executado ===');
    loadTransactions();
  }, [user]); // Dependência do user para recarregar quando mudar

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
    paymentMethod: t.method || t.payment_method,
    date: t.date,
    status: t.status as 'pending' | 'completed' | 'cancelled',
    employeeName: t.user_name,
    receipt: t.receipt,
    tags: t.tags,
    method: t.method || t.payment_method
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
          {debugInfo && (
            <Alert className="mb-4 text-left">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Debug: {debugInfo}
              </AlertDescription>
            </Alert>
          )}
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
            <div className="text-sm text-slate-500 mt-1 space-y-1">
              <p>Total de transações carregadas: {mappedTransactions.length}</p>
              {debugInfo && (
                <p className="text-blue-600">Debug: {debugInfo}</p>
              )}
            </div>
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
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-slate-600">Carregando transações...</p>
                {debugInfo && (
                  <p className="text-sm text-blue-500 mt-2">Debug: {debugInfo}</p>
                )}
              </div>
            ) : (
              <TransactionList 
                transactions={mappedTransactions}
                onView={handleViewTransaction}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}
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
