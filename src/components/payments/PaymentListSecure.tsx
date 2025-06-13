
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Payment, PaymentStatus } from '@/types/payment';
import { FilterModal, FilterConfig } from '@/components/common/FilterModal';
import { ExportModal } from '@/components/common/ExportModal';
import { exportToCSV, exportToPDF, exportToExcel, ExportOptions } from '@/utils/exportUtils';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { PaymentSummaryCards } from './PaymentSummaryCards';
import { PaymentFilters } from './PaymentFilters';
import { PaymentTable } from './PaymentTable';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2 } from "lucide-react";

export const PaymentListSecure = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'newest' | 'oldest'>('newest');
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
  const { data, loading } = useFinancialSimplified();
  const { isValidated, hasCompanyAccess } = useCompanyIsolation();

  // Verificar acesso à empresa
  if (!hasCompanyAccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <Building2 className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Acesso Restrito:</strong> Sua conta não está associada a nenhuma empresa. 
            Entre em contato com o administrador para obter acesso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Usar dados do contexto financeiro (já filtrados por RLS)
  const payments = data.payments || [];

  console.log('🏢 PaymentListSecure: Dados isolados por empresa:', {
    totalPayments: payments.length,
    isValidated,
    hasCompanyAccess
  });

  const applySorting = (payments: Payment[]): Payment[] => {
    return [...payments].sort((a, b) => {
      switch (sortOrder) {
        case 'alphabetical':
          return (a.providerName || '').localeCompare(b.providerName || '');
        case 'newest':
          const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.dueDate).getTime();
          const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.dueDate).getTime();
          return dateB - dateA;
        case 'oldest':
          const dateAOld = a.created_at ? new Date(a.created_at).getTime() : new Date(a.dueDate).getTime();
          const dateBOld = b.created_at ? new Date(b.created_at).getTime() : new Date(b.dueDate).getTime();
          return dateAOld - dateBOld;
        default:
          return 0;
      }
    });
  };

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

  const baseFilteredPayments = payments.filter(payment => {
    if (!payment) return false;
    
    const matchesSearch = (payment.providerName && payment.providerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredPayments = applySorting(applyFilters(baseFilteredPayments));

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

      const filename = options.filename || `pagamentos_empresa_${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, headers, filename);
          break;
        case 'excel':
          exportToExcel(exportData, headers, filename);
          break;
        case 'pdf':
          exportToPDF(exportData, headers, filename, 'Relatório de Pagamentos - Empresa');
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

  const availableProviders = Array.from(new Set(payments.filter(p => p && p.providerId).map(p => p.providerId)))
    .map(id => {
      const payment = payments.find(p => p && p.providerId === id);
      return { 
        value: id as string, 
        label: (payment?.providerName || `Provider ${id}`) as string
      };
    })
    .filter(provider => provider.value && provider.label);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando pagamentos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-sm text-green-700">
          🔒 <strong>Isolamento Ativo:</strong> Exibindo apenas pagamentos da sua empresa ({filteredPayments.length} registros)
        </p>
      </div>

      <PaymentSummaryCards payments={filteredPayments} />

      <Card className="p-6">
        <PaymentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onFilterModalOpen={() => setIsFilterModalOpen(true)}
          onExportModalOpen={() => setIsExportModalOpen(true)}
        />

        <PaymentTable payments={filteredPayments} />
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {payments.length === 0 ? 'Nenhum pagamento cadastrado para esta empresa' : 'Nenhum pagamento encontrado'}
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
