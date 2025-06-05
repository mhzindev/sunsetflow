
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, RefreshCw, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { useProviderExpenses } from '@/hooks/useProviderExpenses';

export const ProviderExpensesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { expenses, loading, error, refetch } = useProviderExpenses();

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      fuel: 'Deslocamento',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || 'Outros';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      completed: 'Concluído',
      reimbursed: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      reimbursed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar despesas
  const filteredExpenses = expenses.filter(expense => {
    const searchMatch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryLabel(expense.category).toLowerCase().includes(searchTerm.toLowerCase());

    const tabMatch = activeTab === 'all' || 
      (activeTab === 'revenues' && expense.isRevenue) ||
      (activeTab === 'expenses' && !expense.isRevenue);

    return searchMatch && tabMatch;
  });

  // Calcular totais
  const totalRevenues = expenses.filter(e => e.isRevenue).reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => !e.isRevenue).reduce((sum, e) => sum + e.amount, 0);
  const netAmount = totalRevenues - totalExpenses;

  const revenueCount = expenses.filter(e => e.isRevenue).length;
  const expenseCount = expenses.filter(e => !e.isRevenue).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-600">Carregando suas despesas...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erro ao carregar despesas: {error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Receitas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenues)}</p>
              <p className="text-xs text-gray-500">{revenueCount} item(s)</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-gray-500">{expenseCount} item(s)</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netAmount)}
              </p>
              <p className="text-xs text-gray-500">Receitas - Despesas</p>
            </div>
            {netAmount >= 0 ? (
              <Plus className="w-8 h-8 text-green-500" />
            ) : (
              <Minus className="w-8 h-8 text-red-500" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Lançamentos</p>
              <p className="text-2xl font-bold text-blue-600">{expenses.length}</p>
              <p className="text-xs text-gray-500">Todos os registros</p>
            </div>
            <RefreshCw 
              className="w-8 h-8 text-blue-500 cursor-pointer hover:animate-spin" 
              onClick={refetch}
            />
          </div>
        </Card>
      </div>

      {/* Lista de despesas */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Minhas Despesas e Receitas</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Todos ({expenses.length})
            </TabsTrigger>
            <TabsTrigger value="revenues" className="text-green-700">
              Receitas ({revenueCount})
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-red-700">
              Despesas ({expenseCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum registro encontrado</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Tente ajustar o termo de busca</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Missão</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <Badge 
                          variant={expense.isRevenue ? "default" : "secondary"}
                          className={expense.isRevenue ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {expense.isRevenue ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Receita
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Despesa
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(expense.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={expense.description}>
                          {expense.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Fonte: {expense.source === 'expenses' ? 'Despesas' : 'Transações'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {expense.mission ? (
                          <div>
                            <div className="font-medium text-sm">{expense.mission.title}</div>
                            {expense.mission.location && (
                              <div className="text-xs text-gray-500">{expense.mission.location}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sem missão</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${expense.isRevenue ? 'text-green-600' : 'text-red-600'}`}>
                          {expense.isRevenue ? '+' : '-'} {formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(expense.status)}>
                          {getStatusLabel(expense.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
