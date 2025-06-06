
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { PaymentSummaryCards } from './PaymentSummaryCards';
import { PaymentFilters } from './PaymentFilters';
import { PaymentTable } from './PaymentTable';
import { PaymentDataHealthCheck } from './PaymentDataHealthCheck';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, refreshData, loading } = useFinancial();
  const payments = data.payments;

  useEffect(() => {
    console.log('=== PAGAMENTOS RECEBIDOS NO PAYMENT MANAGER ===');
    console.log('Total de pagamentos:', payments.length);
    console.log('Pagamentos por status:', {
      pending: payments.filter(p => p.status === 'pending').length,
      completed: payments.filter(p => p.status === 'completed').length,
      partial: payments.filter(p => p.status === 'partial').length
    });

    // Verificar pagamentos órfãos
    const orphanPayments = payments.filter(p => !p.providerId || p.providerId === '' || p.providerId === 'undefined');
    if (orphanPayments.length > 0) {
      console.warn('⚠️ Pagamentos órfãos detectados:', orphanPayments.length);
    }

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

    console.log('Pagamentos filtrados:', filtered.length);
    setFilteredPayments(filtered);
  }, [payments, searchTerm, filterStatus, sortOrder]);

  const handlePaymentCreated = async () => {
    console.log('Pagamento criado, executando refresh...');
    setShowModal(false);
    await handleRefresh();
  };

  const handlePaymentUpdate = async () => {
    console.log('=== PAYMENT UPDATE TRIGGERED ===');
    console.log('Executando refresh dos dados...');
    await handleRefresh();
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      console.log('=== EXECUTANDO REFRESH MANUAL ===');
      await refreshData();
      console.log('✅ Refresh concluído com sucesso');
    } catch (error) {
      console.error('Erro durante refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Pagamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie pagamentos aos prestadores de serviço</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {/* Verificação de Integridade dos Dados */}
      <PaymentDataHealthCheck />

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
          
          {loading || isRefreshing ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">
                {isRefreshing ? 'Atualizando pagamentos...' : 'Carregando pagamentos...'}
              </span>
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
