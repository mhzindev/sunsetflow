
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { PaymentSummaryCards } from './PaymentSummaryCards';
import { PaymentFilters } from './PaymentFilters';
import { PaymentTable } from './PaymentTable';
import { useFinancial } from '@/contexts/FinancialContext';
import { Payment, PaymentStatus } from '@/types/payment';

export const PaymentManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'newest' | 'oldest'>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const { data, refreshData, loading } = useFinancial();
  const payments = data.payments;

  useEffect(() => {
    let filtered = [...payments];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Ordenar
    if (sortOrder === 'alphabetical') {
      filtered.sort((a, b) => a.providerName.localeCompare(b.providerName));
    } else if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    } else if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, filterStatus, sortOrder]);

  const handlePaymentCreated = () => {
    setShowModal(false);
    refreshData(); // Recarregar dados após criar pagamento
  };

  const handlePaymentUpdate = () => {
    refreshData(); // Recarregar dados após atualizar pagamento
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Pagamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie pagamentos aos prestadores de serviço</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      <PaymentSummaryCards payments={payments} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onFilterModalOpen={() => setShowFilterModal(true)}
            onExportModalOpen={() => setShowExportModal(true)}
          />
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Carregando pagamentos...</span>
            </div>
          ) : (
            <PaymentTable 
              payments={filteredPayments} 
              onPaymentUpdate={handlePaymentUpdate}
            />
          )}
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        provider={null}
        paymentType="balance_payment"
        onSuccess={handlePaymentCreated}
      />
    </div>
  );
};
