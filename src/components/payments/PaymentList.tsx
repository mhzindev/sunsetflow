import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { Payment, PaymentStatus } from '@/types/payment';
import { FilterModal, FilterConfig } from '@/components/common/FilterModal';
import { ExportModal } from '@/components/common/ExportModal';
import { exportToCSV, exportToPDF, exportToExcel, ExportOptions } from '@/utils/exportUtils';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const PaymentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterConfig>({
    dateRange: { start: null, end: null },
    status: [],
    amountRange: { min: null, max: null },
    provider: [],
    search: ''
  });

  const { showSuccess, showError } = useToastFeedback();

  // Mock data - em um sistema real, viria de uma API
  const mockPayments: Payment[] = [
    {
      id: '1',
      providerId: '1',
      providerName: 'João Silva - Técnico',
      amount: 2500.00,
      dueDate: '2024-02-01',
      status: 'pending',
      type: 'full',
      description: 'Serviços de instalação - Janeiro 2024',
      notes: 'Pagamento referente às 5 instalações realizadas'
    },
    {
      id: '2',
      providerId: '2',
      providerName: 'Maria Santos - Técnica',
      amount: 1800.00,
      dueDate: '2024-01-28',
      paymentDate: '2024-01-30',
      status: 'overdue',
      type: 'full',
      description: 'Serviços de manutenção - Janeiro 2024',
      notes: 'Manutenção preventiva em 8 veículos'
    },
    {
      id: '3',
      providerId: '3',
      providerName: 'Tech Solutions Ltd',
      amount: 4500.00,
      dueDate: '2024-02-05',
      status: 'pending',
      type: 'installment',
      description: 'Desenvolvimento de módulo personalizado',
      installments: 3,
      currentInstallment: 1,
      notes: 'Primeira parcela de 3'
    },
    {
      id: '4',
      providerId: '4',
      providerName: 'Carlos Oliveira - Freelancer',
      amount: 800.00,
      dueDate: '2024-01-25',
      paymentDate: '2024-01-25',
      status: 'completed',
      type: 'advance',
      description: 'Adiantamento para compra de materiais',
      notes: 'Materiais para instalação em Campinas'
    },
    {
      id: '5',
      providerId: '1',
      providerName: 'João Silva - Técnico',
      amount: 1200.00,
      dueDate: '2024-02-10',
      status: 'partial',
      type: 'full',
      description: 'Pagamento parcial - Projeto especial',
      notes: 'Pagamento de 50% do projeto'
    }
  ];

  const applyFilters = (payments: Payment[]): Payment[] => {
    return payments.filter(payment => {
      // Busca por texto
      const searchMatch = !activeFilters.search || 
        payment.providerName.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        payment.description.toLowerCase().includes(activeFilters.search.toLowerCase());

      // Filtro por status
      const statusMatch = !activeFilters.status?.length || 
        activeFilters.status.includes(payment.status);

      // Filtro por prestador
      const providerMatch = !activeFilters.provider?.length || 
        activeFilters.provider.includes(payment.providerId);

      // Filtro por valor
      const amountMatch = (!activeFilters.amountRange?.min || payment.amount >= activeFilters.amountRange.min) &&
        (!activeFilters.amountRange?.max || payment.amount <= activeFilters.amountRange.max);

      // Filtro por data
      const dateMatch = (!activeFilters.dateRange?.start || 
        new Date(payment.dueDate) >= activeFilters.dateRange.start) &&
        (!activeFilters.dateRange?.end || 
        new Date(payment.dueDate) <= activeFilters.dateRange.end);

      return searchMatch && statusMatch && providerMatch && amountMatch && dateMatch;
    });
  };

  const filteredPayments = applyFilters(mockPayments);

  const handleExport = (options: ExportOptions) => {
    try {
      const headers = ['Prestador', 'Descrição', 'Tipo', 'Valor', 'Vencimento', 'Status'];
      const exportData = filteredPayments.map(payment => ({
        prestador: payment.providerName,
        descricao: payment.description,
        tipo: getTypeLabel(payment.type),
        valor: payment.amount,
        vencimento: new Date(payment.dueDate).toLocaleDateString('pt-BR'),
        status: getStatusLabel(payment.status)
      }));

      const filename = options.filename || `pagamentos_${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, headers, filename);
          break;
        case 'excel':
          exportToExcel(exportData, headers, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, headers, filename, 'Relatório de Pagamentos');
          break;
      }

      showSuccess('Exportação concluída', `Arquivo ${filename}.${options.format} baixado com sucesso`);
    } catch (error) {
      showError('Erro na exportação', 'Não foi possível exportar os dados');
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    const labels = {
      pending: 'Pendente',
      partial: 'Parcial',
      completed: 'Concluído',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };
    return labels[status];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      full: 'Integral',
      installment: 'Parcelado',
      advance: 'Adiantamento',
      partial: 'Parcial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPending = filteredPayments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOverdue = filteredPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCompleted = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableStatuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'partial', label: 'Parcial' },
    { value: 'overdue', label: 'Em Atraso' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const availableProviders = Array.from(new Set(mockPayments.map(p => p.providerId)))
    .map(id => {
      const payment = mockPayments.find(p => p.providerId === id);
      return { value: id, label: payment?.providerName || '' };
    });

  return (
    <div className="space-y-6">
      {/* Resumo de Pagamentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-blue-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-700">Pendentes</h4>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-700">Em Atraso</h4>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-700">Pagos (30 dias)</h4>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalCompleted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por prestador ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="partial">Parcial</option>
              <option value="overdue">Em Atraso</option>
              <option value="completed">Concluído</option>
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

        {/* Tabela de Pagamentos */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prestador</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgência</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => {
              const daysUntilDue = getDaysUntilDue(payment.dueDate);
              const isUrgent = daysUntilDue <= 3 && payment.status !== 'completed';
              
              return (
                <TableRow key={payment.id} className={isUrgent ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">
                    {payment.providerName}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      {payment.installments && (
                        <p className="text-sm text-gray-500">
                          {payment.currentInstallment}/{payment.installments} parcelas
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeLabel(payment.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusLabel(payment.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.status !== 'completed' && (
                      <Badge 
                        variant={daysUntilDue < 0 ? 'destructive' : daysUntilDue <= 3 ? 'secondary' : 'outline'}
                      >
                        {daysUntilDue < 0 
                          ? `${Math.abs(daysUntilDue)} dias atraso`
                          : daysUntilDue === 0 
                            ? 'Vence hoje'
                            : `${daysUntilDue} dias`
                        }
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {payment.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          className={isUrgent ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum pagamento encontrado
          </div>
        )}
      </Card>

      <FilterModal
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filters={activeFilters}
        onFiltersChange={setActiveFilters}
        availableStatuses={availableStatuses}
        availableProviders={availableProviders}
        title="Filtros Avançados - Pagamentos"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        title="Exportar Pagamentos"
        totalRecords={filteredPayments.length}
      />
    </div>
  );
};
