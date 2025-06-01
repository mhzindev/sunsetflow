
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, AlertTriangle, Clock, DollarSign, Eye, Filter } from 'lucide-react';
import { PaymentViewModal } from './PaymentViewModal';
import { PaymentEditModal } from './PaymentEditModal';
import { PaymentModal } from './PaymentModal';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

export const PaymentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { showSuccess } = useToastFeedback();
  const { data, processPayment } = useFinancial();

  // Usar dados do contexto financeiro e calcular urgência dinamicamente
  const upcomingPayments = data.payments.map(payment => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...payment,
      daysUntilDue,
      paymentMethod: 'pix' // Default, pode ser expandido depois
    };
  });

  const getStatusColor = (status: string, daysUntilDue: number) => {
    if (status === 'overdue' || daysUntilDue < 0) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (daysUntilDue <= 3 && status !== 'completed') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string, daysUntilDue: number) => {
    if (status === 'overdue' || daysUntilDue < 0) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (daysUntilDue <= 3 && status !== 'completed') {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else {
      return <CalendarDays className="w-4 h-4 text-blue-600" />;
    }
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return `${Math.abs(daysUntilDue)} dia(s) em atraso`;
    } else if (daysUntilDue === 0) {
      return 'Vence hoje';
    } else if (daysUntilDue === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${daysUntilDue} dias`;
    }
  };

  const filteredPayments = upcomingPayments.filter(payment => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'urgent') return payment.daysUntilDue <= 3 && payment.status !== 'completed';
    if (filterStatus === 'overdue') return payment.daysUntilDue < 0 && payment.status !== 'completed';
    return payment.status === filterStatus;
  });

  const getPaymentsForDate = (date: Date) => {
    return upcomingPayments.filter(payment => {
      const paymentDate = new Date(payment.dueDate);
      return paymentDate.toDateString() === date.toDateString();
    });
  };

  const totalUpcoming = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const overduePayments = filteredPayments.filter(p => p.daysUntilDue < 0 && p.status !== 'completed');
  const urgentPayments = filteredPayments.filter(p => p.daysUntilDue >= 0 && p.daysUntilDue <= 3 && p.status !== 'completed');

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handlePayNow = (payment: any) => {
    setSelectedPayment({
      id: payment.providerId,
      name: payment.providerName,
      service: payment.description,
      paymentMethod: payment.paymentMethod,
      totalPaid: 0
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (updatedPayment: any) => {
    console.log('Payment updated:', updatedPayment);
    showSuccess('Sucesso', 'Pagamento atualizado com sucesso!');
  };

  const handleMarkAsPaid = (payment: any) => {
    console.log('Mark as paid:', payment);
    processPayment(payment);
    showSuccess('Pagamento Confirmado', `Pagamento de ${payment.providerName} marcado como pago!`);
  };

  const handleEditFromView = (payment: any) => {
    setIsViewModalOpen(false);
    setTimeout(() => {
      setSelectedPayment(payment);
      setIsEditModalOpen(true);
    }, 100);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Calendário */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-red-600">Em Atraso</p>
              <p className="text-lg font-semibold text-red-800">{overduePayments.length} pagamentos</p>
              <p className="text-sm text-red-600">
                R$ {overduePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-yellow-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600">Urgente (3 dias)</p>
              <p className="text-lg font-semibold text-yellow-800">{urgentPayments.length} pagamentos</p>
              <p className="text-sm text-yellow-600">
                R$ {urgentPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-blue-200">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Total Próximos</p>
              <p className="text-lg font-semibold text-blue-800">{filteredPayments.length} pagamentos</p>
              <p className="text-sm text-blue-600">
                R$ {totalUpcoming.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Média por Pagamento</p>
              <p className="text-lg font-semibold text-green-800">
                R$ {filteredPayments.length > 0 ? (totalUpcoming / filteredPayments.length).toLocaleString('pt-BR') : '0'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Calendário de Vencimentos</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasPayments: (date) => getPaymentsForDate(date).length > 0,
              overdue: (date) => getPaymentsForDate(date).some(p => p.daysUntilDue < 0 && p.status !== 'completed'),
              urgent: (date) => getPaymentsForDate(date).some(p => p.daysUntilDue >= 0 && p.daysUntilDue <= 3 && p.status !== 'completed')
            }}
            modifiersStyles={{
              hasPayments: { backgroundColor: '#e0f2fe', fontWeight: 'bold' },
              overdue: { backgroundColor: '#fee2e2', color: '#dc2626' },
              urgent: { backgroundColor: '#fef3c7', color: '#d97706' }
            }}
          />
          
          {selectedDate && (
            <div className="mt-4">
              <h5 className="font-medium text-slate-800 mb-2">
                Pagamentos para {selectedDate.toLocaleDateString('pt-BR')}:
              </h5>
              {getPaymentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getPaymentsForDate(selectedDate).map(payment => (
                    <div key={payment.id} className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium">{payment.providerName}</p>
                      <p className="text-gray-600">R$ {payment.amount.toLocaleString('pt-BR')}</p>
                      <Badge className={`text-xs ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {payment.status === 'completed' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum pagamento nesta data</p>
              )}
            </div>
          )}
        </Card>

        {/* Filtros e Lista */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Próximos Pagamentos</h4>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="overdue">Em Atraso</option>
                <option value="urgent">Urgente</option>
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPayments.map((payment) => (
              <div 
                key={payment.id} 
                className={`p-4 rounded-lg border-2 ${getStatusColor(payment.status, payment.daysUntilDue)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status, payment.daysUntilDue)}
                    <div>
                      <h5 className="font-medium text-slate-800">{payment.providerName}</h5>
                      <p className="text-sm text-slate-600">
                        Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {payment.status === 'completed' ? 'Pago' : getUrgencyText(payment.daysUntilDue)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewPayment(payment)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditPayment(payment)}
                  >
                    Editar
                  </Button>
                  {payment.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      className={
                        payment.daysUntilDue < 0 || payment.daysUntilDue <= 3
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                      onClick={() => handlePayNow(payment)}
                    >
                      Pagar Agora
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <PaymentViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        payment={selectedPayment}
        onEdit={handleEditFromView}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <PaymentEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        payment={selectedPayment}
        onSave={handleSavePayment}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModals}
        provider={selectedPayment}
      />
    </div>
  );
};
