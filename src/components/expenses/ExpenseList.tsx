import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, Edit, Plus, Minus } from 'lucide-react';
import { FilterModal, FilterConfig } from '@/components/common/FilterModal';
import { ExportModal } from '@/components/common/ExportModal';
import { ExpenseViewModal } from './ExpenseViewModal';
import { ExpenseEditModal } from './ExpenseEditModal';
import { exportToCSV, exportToPDF, exportToExcel, ExportOptions } from '@/utils/exportUtils';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface ExpenseListItem {
  id: string;
  mission: {
    title?: string;
    location?: string;
    client_name?: string;
  } | string;
  employee: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: string;
  type?: 'expense' | 'revenue';
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
  };
  travelDetails?: {
    kilometers: number;
    ratePerKm: number;
    totalRevenue: number;
  };
  employee_role?: string;
  receipt?: string;
}

export const ExpenseList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseListItem | null>(null);
  const [revenues, setRevenues] = useState<any[]>([]);
  
  const [activeFilters, setActiveFilters] = useState<FilterConfig>({
    dateRange: { start: null, end: null },
    status: [],
    category: [],
    amountRange: { min: null, max: null },
    search: ''
  });

  const { showSuccess, showError } = useToastFeedback();
  const { data, updateExpenseStatus } = useFinancialSimplified();
  const { fetchTransactions } = useSupabaseData();

  // Carregar receitas de hospedagem/deslocamento
  useEffect(() => {
    const loadRevenues = async () => {
      try {
        const transactionsData = await fetchTransactions();
        const revenueTransactions = transactionsData.filter((transaction: any) => 
          transaction.type === 'income' && 
          (transaction.category === 'fuel' || transaction.category === 'accommodation')
        );
        setRevenues(revenueTransactions);
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
      }
    };
    loadRevenues();
  }, [fetchTransactions]);

  // Combinar despesas e receitas
  const allItems: ExpenseListItem[] = [
    // Despesas normais
    ...data.expenses.map(expense => {
      const accommodationDetails = expense.accommodationDetails ? {
        actualCost: expense.accommodationDetails.actualCost || 0,
        reimbursementAmount: expense.accommodationDetails.invoiceAmount || 0,
        netAmount: expense.accommodationDetails.netAmount || 0
      } : undefined;

      return {
        id: expense.id,
        mission: expense.missions ? {
          title: expense.missions.title || `Missão ${expense.missionId?.slice(0, 8)}`,
          location: expense.missions.location,
          client_name: expense.missions.client_name
        } : `Missão ${expense.missionId?.slice(0, 8) || 'N/A'}`,
        employee: expense.employeeName,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        isAdvanced: expense.isAdvanced,
        status: expense.status,
        type: 'expense' as const,
        accommodationDetails,
        employee_role: expense.employee_role || 'Funcionário'
      };
    }),
    
    // Receitas de hospedagem/deslocamento
    ...revenues.map(revenue => ({
      id: revenue.id,
      mission: revenue.mission_id ? {
        title: `Missão ${revenue.mission_id.slice(0, 8)}`,
        location: 'N/A',
        client_name: 'N/A'
      } : 'Sem missão',
      employee: revenue.user_name || 'Sistema',
      category: revenue.category === 'fuel' ? 'displacement' : revenue.category, // Mapear fuel para displacement na exibição
      description: revenue.description,
      amount: revenue.amount,
      date: revenue.date,
      isAdvanced: false,
      status: revenue.status,
      type: 'revenue' as const,
      employee_role: 'Prestador'
    }))
  ];

  // Função auxiliar para formatar valores com segurança
  const formatCurrency = (value?: number) => {
    if (value == null || value === undefined) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const applyFilters = (items: ExpenseListItem[]) => {
    return items.filter(item => {
      const missionTitle = typeof item.mission === 'object' ? item.mission.title : item.mission;
      const searchMatch = !activeFilters.search || 
        item.employee.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        (missionTitle && missionTitle.toLowerCase().includes(activeFilters.search.toLowerCase()));

      const statusMatch = !activeFilters.status?.length || 
        activeFilters.status.includes(item.status);

      const categoryMatch = !activeFilters.category?.length || 
        activeFilters.category.includes(item.category);

      const amountMatch = (!activeFilters.amountRange?.min || item.amount >= activeFilters.amountRange.min) &&
        (!activeFilters.amountRange?.max || item.amount <= activeFilters.amountRange.max);

      const dateMatch = (!activeFilters.dateRange?.start || 
        new Date(item.date) >= activeFilters.dateRange.start) &&
        (!activeFilters.dateRange?.end || 
        new Date(item.date) <= activeFilters.dateRange.end);

      return searchMatch && statusMatch && categoryMatch && amountMatch && dateMatch;
    });
  };

  const filteredItems = applyFilters(allItems.filter(item => {
    if (!searchTerm) return true;
    
    const missionTitle = typeof item.mission === 'object' ? item.mission.title : item.mission;
    return item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (missionTitle && missionTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  }));

  const handleViewExpense = (expense: ExpenseListItem) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  const handleEditExpense = (expense: ExpenseListItem) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleSaveExpense = (updatedExpense: ExpenseListItem) => {
    updateExpenseStatus(updatedExpense.id, updatedExpense.status as any);
    showSuccess('Despesa Atualizada', 'As alterações foram salvas e impactaram o sistema financeiro');
  };

  const handleApproveExpense = (expense: ExpenseListItem) => {
    updateExpenseStatus(expense.id, 'approved');
    showSuccess(
      'Despesa Aprovada', 
      `Despesa de R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} aprovada e registrada no sistema financeiro`
    );
  };

  const handleExport = (options: ExportOptions) => {
    try {
      const headers = ['Tipo', 'Missão', 'Cliente', 'Funcionário', 'Cargo', 'Categoria', 'Descrição', 'Valor', 'Data', 'Status'];
      const exportData = filteredItems.map(item => {
        const mission = typeof item.mission === 'object' ? item.mission : { title: item.mission };
        return {
          tipo: item.type === 'revenue' ? 'Receita' : 'Despesa',
          missao: mission.title || 'N/A',
          cliente: mission.client_name || 'N/A',
          funcionario: item.employee,
          cargo: item.employee_role,
          categoria: getCategoryLabel(item.category),
          descricao: item.description,
          valor: item.amount,
          data: new Date(item.date).toLocaleDateString('pt-BR'),
          status: getStatusLabel(item.status)
        };
      });

      const filename = options.filename || `despesas_receitas_${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, headers, filename);
          break;
        case 'excel':
          exportToExcel(exportData, headers, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, headers, filename, 'Relatório de Despesas e Receitas');
          break;
      }

      showSuccess('Exportação concluída', `Arquivo ${filename}.${options.format} baixado com sucesso`);
    } catch (error) {
      showError('Erro na exportação', 'Não foi possível exportar os dados');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      displacement: 'bg-orange-100 text-orange-800', // Mudança aqui: displacement em vez de fuel
      fuel: 'bg-orange-100 text-orange-800', // Manter fuel para compatibilidade
      accommodation: 'bg-blue-100 text-blue-800',
      meals: 'bg-green-100 text-green-800',
      transportation: 'bg-purple-100 text-purple-800',
      materials: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      displacement: 'Deslocamento', // Mudança aqui: displacement label
      fuel: 'Deslocamento', // Manter fuel para compatibilidade, mas exibir como Deslocamento
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      transportation: 'Transporte',
      materials: 'Materiais',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || 'Outros';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Aguardando Aprovação',
      approved: 'Aprovado',
      completed: 'Concluído'
    };
    return labels[status as keyof typeof labels] || 'Aguardando Aprovação';
  };

  const availableStatuses = [
    { value: 'pending', label: 'Aguardando Aprovação' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'completed', label: 'Concluído' }
  ];

  const availableCategories = [
    { value: 'displacement', label: 'Deslocamento' }, // Mudança aqui: displacement em vez de fuel
    { value: 'fuel', label: 'Deslocamento' }, // Manter fuel para compatibilidade
    { value: 'accommodation', label: 'Hospedagem' },
    { value: 'meals', label: 'Alimentação' },
    { value: 'transportation', label: 'Transporte' },
    { value: 'materials', label: 'Materiais' },
    { value: 'other', label: 'Outros' }
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-800">Todas as Despesas e Receitas</h4>
          <p className="text-sm text-gray-600 mt-1">
            {filteredItems.length} registro(s) encontrado(s)
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
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Missão/Cliente</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => {
            const mission = typeof item.mission === 'object' ? item.mission : { title: item.mission };
            return (
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
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{mission.title || 'N/A'}</div>
                    {mission.client_name && (
                      <div className="text-xs text-gray-600">Cliente: {mission.client_name}</div>
                    )}
                    {mission.location && (
                      <div className="text-xs text-gray-500">{mission.location}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.employee}</div>
                    <div className="text-xs text-gray-600">{item.employee_role}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(item.category)}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{item.description}</div>
                    {item.accommodationDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>Gasto da Empresa: {formatCurrency(item.accommodationDetails.actualCost)}</div>
                        <div>Nota Fiscal: {formatCurrency(item.accommodationDetails.reimbursementAmount)}</div>
                        <div className={`font-medium ${item.accommodationDetails.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Receita Líquida: {item.accommodationDetails.netAmount >= 0 ? '+' : ''}{formatCurrency(item.accommodationDetails.netAmount)}
                        </div>
                      </div>
                    )}
                    {item.travelDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>{item.travelDetails.kilometers} km × {formatCurrency(item.travelDetails.ratePerKm)}</div>
                        <div className="font-medium text-green-600">Receita Total: +{formatCurrency(item.travelDetails.totalRevenue)}</div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  <span className={`${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.type === 'expense' ? '-' : '+'}
                    {formatCurrency(item.amount)}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewExpense(item)}
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {item.type === 'expense' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditExpense(item)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {allItems.length === 0 ? (
            <div>
              <p>Nenhuma despesa ou receita registrada ainda</p>
              <p className="text-sm mt-1">Comece registrando sua primeira despesa</p>
            </div>
          ) : (
            <p>Nenhum registro encontrado com os filtros aplicados</p>
          )}
        </div>
      )}

      <ExpenseViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        expense={selectedExpense}
        onEdit={handleEditExpense}
        onApprove={handleApproveExpense}
      />

      <ExpenseEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        expense={selectedExpense}
        onSave={handleSaveExpense}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
        availableStatuses={availableStatuses}
        availableCategories={availableCategories}
        title="Filtros Avançados - Despesas e Receitas"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        title="Exportar Despesas e Receitas"
        totalRecords={filteredItems.length}
      />
    </Card>
  );
};
