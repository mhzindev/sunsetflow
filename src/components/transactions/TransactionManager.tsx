import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { TransactionCategories } from './TransactionCategories';
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Plus, RefreshCw, AlertCircle, Info, CheckCircle, Eye } from "lucide-react";
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

  const isOwner = profile?.role === 'admin' || profile?.user_type === 'admin';
  const isProvider = profile?.user_type === 'provider';

  const loadTransactions = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('');
      
      console.log('=== DEBUG: Carregando transações com nova lógica hierárquica ===');
      console.log('User ID:', user?.id);
      console.log('User email:', user?.email);
      console.log('Profile:', profile);
      console.log('É dono?', isOwner);
      console.log('É prestador?', isProvider);
      
      const data = await fetchTransactions();
      
      console.log('=== DEBUG: Dados retornados com RLS hierárquica ===');
      console.log('Tipo dos dados:', typeof data);
      console.log('É array?', Array.isArray(data));
      console.log('Quantidade de items:', data?.length);
      
      if (isOwner) {
        console.log('DONO DA EMPRESA: Deve ver todas as transações');
        const revenueTransactions = data?.filter(t => 
          t.type === 'income' && (t.category === 'fuel' || t.category === 'accommodation')
        ) || [];
        console.log('Receitas de deslocamento/hospedagem:', revenueTransactions.length);
      } else {
        console.log('PRESTADOR: Deve ver apenas suas próprias transações');
      }
      
      if (Array.isArray(data)) {
        setTransactions(data);
        setDebugInfo(`${isOwner ? 'DONO' : 'PRESTADOR'}: ${data.length} transações carregadas`);
        
        if (showToast) {
          toast({
            title: "Transações atualizadas",
            description: `${data.length} transações carregadas ${isOwner ? '(visão completa da empresa)' : '(suas transações)'}.`,
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
    console.log('=== DEBUG: useEffect executado com nova lógica ===');
    loadTransactions();
  }, [user, profile]); // Dependência do profile para recarregar quando o tipo mudar

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

  // Filtrar transações por tipo para mostrar estatísticas
  const revenueTransactions = mappedTransactions.filter(t => t.type === 'income');
  const expenseTransactions = mappedTransactions.filter(t => t.type === 'expense');
  const providerRevenueTransactions = revenueTransactions.filter(t => 
    t.category === 'fuel' || t.category === 'accommodation'
  );

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
              {isOwner && <span className="ml-2 text-green-600">(Visão da Empresa)</span>}
              {isProvider && <span className="ml-2 text-blue-600">(Minhas Transações)</span>}
            </h3>
            <p className="text-slate-600">
              {isOwner 
                ? 'Visualize e gerencie todas as transações da empresa, incluindo receitas de deslocamento e hospedagem dos prestadores.'
                : 'Registre suas despesas de viagem e visualize seus lançamentos.'
              }
            </p>
            <div className="text-sm text-slate-500 mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span>Total de transações: {mappedTransactions.length}</span>
                {!loading && mappedTransactions.length > 0 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              {isOwner && providerRevenueTransactions.length > 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <Eye className="w-4 h-4" />
                  <span>Receitas de prestadores: {providerRevenueTransactions.length}</span>
                </div>
              )}
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

        {/* Mostrar estatísticas para donos */}
        {isOwner && !loading && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Estatísticas:</strong> {revenueTransactions.length} receitas, {expenseTransactions.length} despesas.
              {providerRevenueTransactions.length > 0 && (
                <span className="text-green-600 ml-2">
                  Incluindo {providerRevenueTransactions.length} receitas de deslocamento/hospedagem.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${profile?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="list">
              Transações ({mappedTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="new">Nova Transação</TabsTrigger>
            {isOwner && (
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-slate-600">Carregando transações...</p>
                <p className="text-sm text-blue-500 mt-2">Usando nova lógica hierárquica RLS</p>
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

          {isOwner && (
            <TabsContent value="categories" className="mt-6">
              <TransactionCategories />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
};
