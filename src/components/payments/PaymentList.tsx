
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Payment, PaymentStatus } from '@/types/payment';
import { FilterModal, FilterConfig } from '@/components/common/FilterModal';
import { ExportModal } from '@/components/common/ExportModal';
import { exportToCSV, exportToPDF, exportToExcel, ExportOptions } from '@/utils/exportUtils';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { PaymentSummaryCards } from './PaymentSummaryCards';
import { PaymentFilters } from './PaymentFilters';
import { PaymentTable } from './PaymentTable';

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
    if (!payments || !Array.isArray(payments)) {
      return [];
    }

    return payments.filter(payment => {
      if (!payment) return false;

      // Busca por texto
      const searchMatch = !activeFilters.search || 
        (payment.providerName && payment.providerName.toLowerCase().includes(activeFilters.search.toLowerCase())) ||
        (payment.description && payment.description.toLowerCase().includes(activeFilters.search.toLowerCase()));

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

  const baseFilteredPayments = mockPayments.filter(payment => {
    if (!payment) return false;
    
    const matchesSearch = (payment.providerName && payment.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredPayments = applyFilters(baseFilteredPayments);

  const handleExport = (options: ExportOptions) => {
    try {
      const headers = ['Prestador', 'Descrição', 'Tipo', 'Valor', 'Vencimento', 'Status'];
      const exportData = filteredPayments.map(payment => ({
        prestador: payment?.providerName || '',
        descricao: payment?.description || '',
        tipo: getTypeLabel(payment?.type || ''),
        valor: payment?.amount || 0,
        vencimento: payment?.dueDate ? new Date(payment.dueDate).toLocaleDateString('pt-BR') : '',
        status: getStatusLabel(payment?.status || 'pending')
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

  const getStatusLabel = (status: PaymentStatus) => {
    const labels = {
      pending: 'Pendente',
      partial: 'Parcial',
      completed: 'Concluído',
      overdue: 'Em Atraso',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
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

  const availableStatuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'partial', label: 'Parcial' },
    { value: 'overdue', label: 'Em Atraso' },
    { value: 'completed', label: 'Concluído' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const availableProviders = Array.from(new Set(mockPayments.filter(p => p && p.providerId).map(p => p.providerId)))
    .map(id => {
      const payment = mockPayments.find(p => p && p.providerId === id);
      return { 
        value: id, 
        label: payment?.providerName || `Provider ${id}`
      };
    })
    .filter(provider => provider.value && provider.label);

  return (
    <div className="space-y-6">
      <PaymentSummaryCards payments={filteredPayments} />

      <Card className="p-6">
        <PaymentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          onFilterModalOpen={() => setIsFilterModalOpen(true)}
          onExportModalOpen={() => setIsExportModalOpen(true)}
        />

        <PaymentTable payments={filteredPayments} />
        
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
