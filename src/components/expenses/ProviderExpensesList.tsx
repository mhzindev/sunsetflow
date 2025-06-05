
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, Plus, Minus, Eye } from 'lucide-react';
import { useProviderExpenses } from '@/hooks/useProviderExpenses';

export const ProviderExpensesList = () => {
  const { expenses, loading, error, refresh, isProvider } = useProviderExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'revenue'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  if (!isProvider) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-slate-600">Esta seção é apenas para prestadores de serviço.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando suas despesas...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  // Filtrar dados
  const filteredExpenses = expenses.filter(item => {
    const matchesSearch = !searchTerm || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mission?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Calcular totais
  const totals = {
    expenses: expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    revenues: expenses.filter(e => e.type === 'revenue').reduce((sum, e) => sum + e.amount, 0)
  };
  const netTotal = totals.revenues - totals.expenses;

  const getCategoryColor = (category: string) => {
    const colors = {
      fuel: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-blue-100 text-blue-800',
      meals: 'bg-green-100 text-green-800',
      materials: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      reimbursed: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
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

  const availableCategories = [...new Set(expenses.map(e => e.category))];

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="text-lg font-semibold text-red-600 flex items-center">
                <Minus className="w-4 h-4 mr-1" />
                R$ {totals.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Receitas</p>
              <p className="text-lg font-semibold text-green-600 flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                R$ {totals.revenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Líquido</p>
              <p className={`text-lg font-semibold ${netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netTotal >= 0 ? '+' : ''}R$ {netTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Registros</p>
              <p className="text-lg font-semibold text-blue-600">
                {expenses.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Despesas/Receitas */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Minhas Despesas e Receitas</h4>
            <p className="text-sm text-gray-600 mt-1">
              {filteredExpenses.length} registro(s) encontrado(s)
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
                <SelectItem value="revenue">Receitas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

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
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((item) => (
              <TableRow key={`${item.type}-${item.id}`}>
                <TableCell>
                  <div className="flex items-center">
                    {item.type === 'expense' ? (
                      <Badge variant="destructive" className="flex items-center">
                        <Minus className="w-3 h-3 mr-1" />
                        Despesa
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800 flex items-center">
                        <Plus className="w-3 h-3 mr-1" />
                        Receita
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(item.category)}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.description}</div>
                    {item.accommodationDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>Gasto: R$ {(item.accommodationDetails.actualCost || 0).toFixed(2)}</div>
                        <div>Nota: R$ {(item.accommodationDetails.reimbursementAmount || 0).toFixed(2)}</div>
                        <div className={`font-medium ${(item.accommodationDetails.netAmount || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Líquido: {(item.accommodationDetails.netAmount || 0) >= 0 ? '+' : ''}R$ {(item.accommodationDetails.netAmount || 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                    {item.travelDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>{(item.travelDetails.kilometers || 0)} km × R$ {(item.travelDetails.ratePerKm || 0).toFixed(2)}</div>
                        <div>Total: R$ {(item.travelDetails.totalRevenue || 0).toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.mission ? (
                    <div>
                      <div className="font-medium text-sm">{item.mission.title}</div>
                      {item.mission.location && (
                        <div className="text-xs text-gray-500">{item.mission.location}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sem missão</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-semibold ${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.type === 'expense' ? '-' : '+'}R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" title="Visualizar detalhes">
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {expenses.length === 0 ? (
              <div>
                <p>Nenhuma despesa ou receita registrada ainda</p>
                <p className="text-sm mt-1">Comece registrando sua primeira despesa</p>
              </div>
            ) : (
              <p>Nenhum registro encontrado com os filtros aplicados</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
