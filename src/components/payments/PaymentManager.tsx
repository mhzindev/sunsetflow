
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { PaymentSummaryCards } from './PaymentSummaryCards';
import { PaymentFilters } from './PaymentFilters';
import { PaymentTable } from './PaymentTable';
import { useFinancial } from '@/contexts/FinancialContext';
import { Payment } from '@/types/payment';

export const PaymentManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const { payments, loadPayments, loading } = useFinancial();

  useEffect(() => {
    setFilteredPayments(payments);
  }, [payments]);

  useEffect(() => {
    loadPayments();
  }, []);

  const handleFilter = (filtered: Payment[]) => {
    setFilteredPayments(filtered);
  };

  const handlePaymentCreated = () => {
    setShowModal(false);
    loadPayments(); // Recarregar dados após criar pagamento
  };

  const handlePaymentUpdate = () => {
    loadPayments(); // Recarregar dados após atualizar pagamento
  };

  const handleRefresh = () => {
    loadPayments();
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
          <PaymentFilters payments={payments} onFilter={handleFilter} />
          
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
        onClose={() => setShowModal(false)}
        onPaymentCreated={handlePaymentCreated}
      />
    </div>
  );
};
