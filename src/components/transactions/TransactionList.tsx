import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { FilterModal, FilterConfig } from '@/components/common/FilterModal';
import { ExportModal } from '@/components/common/ExportModal';
import { TransactionViewModal } from './TransactionViewModal';
import { TransactionEditModal } from './TransactionEditModal';
import { exportToCSV, exportToPDF, exportToExcel, ExportOptions } from '@/utils/exportUtils';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Transaction } from '@/types/transaction';

export const TransactionList = () => {
  const { user } = useAuth();
  const { data } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterConfig>({
    dateRange: { start: null, end: null },
    status: [],
    category: [],
    amountRange: { min: null, max: null },
    search: ''
  });

  const { showSuccess, showError } = useToastFeedback();

  const applyFilters = (transactions: typeof data.transactions) => {
    return transactions.filter(transaction => {
      const searchMatch = !activeFilters.search || 
        transaction.description.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        transaction.userName.toLowerCase().includes(activeFilters.search.toLowerCase());

      const statusMatch = !activeFilters.status?.length || 
        activeFilters.status.includes(transaction.status);

      const categoryMatch = !activeFilters.category?.length || 
        activeFilters.category.includes(transaction.category);

      const amountMatch = (!activeFilters.amountRange?.min || transaction.amount >= activeFilters.amountRange.min) &&
        (!activeFilters.amountRange?.max || transaction.amount <= activeFilters.amountRange.max);

      const dateMatch = (!activeFilters.dateRange?.start || 
        new Date(transaction.date) >= activeFilters.dateRange.start) &&
        (!activeFilters.dateRange?.end || 
        new Date(transaction.date) <= activeFilters.dateRange.end);

      const matchesUser = user?.role === 'owner' || transaction.userId === user?.id;

      return searchMatch && statusMatch && categoryMatch && amountMatch && dateMatch && matchesUser;
    });
  };

  const baseFilteredTransactions = data.transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesUser = user?.role === 'owner' || transaction.userId === user?.id;
    
    return matchesSearch && matchesFilter && matchesUser;
  });

  const filteredTransactions = applyFilters(baseFilteredTransactions);

  const handleExport = (options: ExportOptions) => {
    try {
      const headers = ['Data', 'Descrição', 'Categoria', 'Usuário', 'Método', 'Valor', 'Status'];
      const exportData = filteredTransactions.map(transaction => ({
        data: new Date(transaction.date).toLocaleDateString('pt-BR'),
        descricao: transaction.description,
        categoria: getCategoryLabel(transaction.category),
        usuario: transaction.userName,
        metodo: getMethodLabel(transaction.method),
        valor: `${transaction.type === 'income' ? '+' : '-'}${transaction.amount}`,
        status: getStatusLabel(transaction.status)
      }));

      const filename = options.filename || `transacoes_${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, headers, filename);
          break;
        case 'excel':
          exportToExcel(exportData, headers, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, headers, filename, 'Relatório de Transações');
          break;
      }

      showSuccess('Exportação concluída', `Arquivo ${filename}.${options.format} baixado com sucesso`);
    } catch (error) {
      showError('Erro na exportação', 'Não foi possível exportar os dados');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      service_payment: 'Pagamento Serviços',
      client_payment: 'Recebimento Cliente',
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      maintenance: 'Manutenção',
      office_expense: 'Despesa Escritório',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      pix: 'PIX',
      transfer: 'Transferência',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const availableStatuses = [
    { value: 'completed', label: 'Concluído' },
    { value: 'pending', label: 'Pendente' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const availableCategories = [
    { value: 'service_payment', label: 'Pagamento Serviços' },
    { value: 'client_payment', label: 'Recebimento Cliente' },
    { value: 'fuel', label: 'Combustível' },
    { value: 'accommodation', label: 'Hospedagem' },
    { value: 'meals', label: 'Alimentação' },
    { value: 'materials', label: 'Materiais' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'office_expense', label: 'Despesa Escritório' },
    { value: 'other', label: 'Outros' }
  ];

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleEditFromView = (transaction: Transaction) => {
    setIsViewModalOpen(false);
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    // Here you would typically update the transaction in your data store
    console.log('Transaction updated:', updatedTransaction);
    // For now, we'll just close the modal and show success message
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold text-green-700">Total de Entradas</h4>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="font-semibold text-red-700">Total de Saídas</h4>
          <p className="text-2xl font-bold text-red-600">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4">
          <h4 className="font-semibold text-blue-700">Saldo Líquido</h4>
          <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {(totalIncome - totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por descrição ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluído</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Tabela de Transações */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getCategoryLabel(transaction.category)}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.userName}</TableCell>
                <TableCell>{getMethodLabel(transaction.method)}</TableCell>
                <TableCell className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTransaction(transaction)}
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {(user?.role === 'owner' || transaction.userId === user?.id) && transaction.status !== 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTransaction(transaction)}
                        title="Editar transação"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {transaction.receipt && (
                      <Button variant="outline" size="sm" title="Ver Comprovante">
                        📎
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {data.transactions.length === 0 ? (
              <div>
                <p>Nenhuma transação registrada ainda</p>
                <p className="text-sm mt-1">Comece registrando sua primeira transação</p>
              </div>
            ) : (
              <p>Nenhuma transação encontrada com os filtros aplicados</p>
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
        availableStatuses={availableStatuses}
        availableCategories={availableCategories}
        title="Filtros Avançados - Transações"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        title="Exportar Transações"
        totalRecords={filteredTransactions.length}
      />

      <TransactionViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onEdit={handleEditFromView}
      />

      <TransactionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};
