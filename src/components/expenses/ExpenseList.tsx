import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, Edit } from 'lucide-react';
import { FilterModal, FilterConfig } from '@/components/common/FilterModal';
import { ExportModal } from '@/components/common/ExportModal';
import { ExpenseViewModal } from './ExpenseViewModal';
import { ExpenseEditModal } from './ExpenseEditModal';
import { exportToCSV, exportToPDF, exportToExcel, ExportOptions } from '@/utils/exportUtils';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

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
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
  };
  employee_role?: string;
}

export const ExpenseList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseListItem | null>(null);
  
  const [activeFilters, setActiveFilters] = useState<FilterConfig>({
    dateRange: { start: null, end: null },
    status: [],
    category: [],
    amountRange: { min: null, max: null },
    search: ''
  });

  const { showSuccess, showError } = useToastFeedback();
  const { data, updateExpenseStatus } = useFinancial();

  // Usar dados reais do contexto financeiro
  const expenses: ExpenseListItem[] = data.expenses.map(expense => {
    // Ensure accommodationDetails has the required structure if it exists
    const accommodationDetails = expense.accommodationDetails ? {
      actualCost: expense.accommodationDetails.actualCost || 0,
      reimbursementAmount: expense.accommodationDetails.reimbursementAmount || 0,
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
      accommodationDetails,
      employee_role: expense.employee_role || 'Funcionário'
    };
  });

  // Função auxiliar para formatar valores com segurança
  const formatCurrency = (value?: number) => {
    if (value == null || value === undefined) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const applyFilters = (expenses: ExpenseListItem[]) => {
    return expenses.filter(expense => {
      const missionTitle = typeof expense.mission === 'object' ? expense.mission.title : expense.mission;
      const searchMatch = !activeFilters.search || 
        expense.employee.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        expense.description.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        (missionTitle && missionTitle.toLowerCase().includes(activeFilters.search.toLowerCase()));

      const statusMatch = !activeFilters.status?.length || 
        activeFilters.status.includes(expense.status);

      const categoryMatch = !activeFilters.category?.length || 
        activeFilters.category.includes(expense.category);

      const amountMatch = (!activeFilters.amountRange?.min || expense.amount >= activeFilters.amountRange.min) &&
        (!activeFilters.amountRange?.max || expense.amount <= activeFilters.amountRange.max);

      const dateMatch = (!activeFilters.dateRange?.start || 
        new Date(expense.date) >= activeFilters.dateRange.start) &&
        (!activeFilters.dateRange?.end || 
        new Date(expense.date) <= activeFilters.dateRange.end);

      return searchMatch && statusMatch && categoryMatch && amountMatch && dateMatch;
    });
  };

  const filteredExpenses = applyFilters(expenses.filter(expense => {
    if (!searchTerm) return true;
    
    const missionTitle = typeof expense.mission === 'object' ? expense.mission.title : expense.mission;
    return expense.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const headers = ['Missão', 'Cliente', 'Funcionário', 'Cargo', 'Categoria', 'Descrição', 'Valor', 'Data', 'Tipo', 'Status'];
      const exportData = filteredExpenses.map(expense => {
        const mission = typeof expense.mission === 'object' ? expense.mission : { title: expense.mission };
        return {
          missao: mission.title || 'N/A',
          cliente: mission.client_name || 'N/A',
          funcionario: expense.employee,
          cargo: expense.employee_role,
          categoria: getCategoryLabel(expense.category),
          descricao: expense.description,
          valor: expense.amount,
          data: new Date(expense.date).toLocaleDateString('pt-BR'),
          tipo: expense.isAdvanced ? 'Adiantamento' : 'Reembolso',
          status: getStatusLabel(expense.status)
        };
      });

      const filename = options.filename || `despesas_${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, headers, filename);
          break;
        case 'excel':
          exportToExcel(exportData, headers, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, headers, filename, 'Relatório de Despesas');
          break;
      }

      showSuccess('Exportação concluída', `Arquivo ${filename}.${options.format} baixado com sucesso`);
    } catch (error) {
      showError('Erro na exportação', 'Não foi possível exportar os dados');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fuel: 'bg-orange-100 text-orange-800',
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
      reimbursed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      fuel: 'Combustível',
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
      pending: 'Pendente',
      approved: 'Aprovado',
      reimbursed: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || 'Pendente';
  };

  const availableStatuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'reimbursed', label: 'Reembolsado' }
  ];

  const availableCategories = [
    { value: 'fuel', label: 'Combustível' },
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
          <h4 className="text-lg font-semibold text-slate-800">Todas as Despesas</h4>
          <p className="text-sm text-gray-600 mt-1">
            {filteredExpenses.length} despesa(s) encontrada(s)
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar despesas..."
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
            <TableHead>Missão/Cliente</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExpenses.map((expense) => {
            const mission = typeof expense.mission === 'object' ? expense.mission : { title: expense.mission };
            return (
              <TableRow key={expense.id}>
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
                    <div className="font-medium">{expense.employee}</div>
                    <div className="text-xs text-gray-600">{expense.employee_role}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(expense.category)}>
                    {getCategoryLabel(expense.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{expense.description}</div>
                    {expense.accommodationDetails && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>Gasto: {formatCurrency(expense.accommodationDetails.actualCost)}</div>
                        <div>Ressarcimento: {formatCurrency(expense.accommodationDetails.reimbursementAmount)}</div>
                        <div className={`font-medium ${expense.accommodationDetails.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Líquido: {expense.accommodationDetails.netAmount >= 0 ? '+' : ''}{formatCurrency(expense.accommodationDetails.netAmount)}
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {expense.accommodationDetails ? (
                    <div>
                      <div className="text-red-600">{formatCurrency(expense.amount)}</div>
                      <div className="text-xs text-gray-500">
                        Líquido: {expense.accommodationDetails.netAmount >= 0 ? '+' : ''}{formatCurrency(expense.accommodationDetails.netAmount)}
                      </div>
                    </div>
                  ) : (
                    formatCurrency(expense.amount)
                  )}
                </TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>
                  <Badge variant={expense.isAdvanced ? 'default' : 'secondary'}>
                    {expense.category === 'accommodation' ? 'Hospedagem' : (expense.isAdvanced ? 'Adiantamento' : 'Reembolso')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(expense.status)}>
                    {getStatusLabel(expense.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewExpense(expense)}
                      title="Visualizar despesa"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditExpense(expense)}
                      title="Editar despesa"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {expenses.length === 0 ? (
            <div>
              <p>Nenhuma despesa registrada ainda</p>
              <p className="text-sm mt-1">Comece registrando sua primeira despesa</p>
            </div>
          ) : (
            <p>Nenhuma despesa encontrada com os filtros aplicados</p>
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
        title="Filtros Avançados - Despesas"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        title="Exportar Despesas"
        totalRecords={filteredExpenses.length}
      />
    </Card>
  );
};
