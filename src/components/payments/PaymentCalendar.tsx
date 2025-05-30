
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertTriangle, Clock } from 'lucide-react';

export const PaymentCalendar = () => {
  const upcomingPayments = [
    {
      id: '1',
      providerName: 'João Silva - Técnico',
      amount: 2500.00,
      dueDate: '2024-02-01',
      status: 'pending',
      daysUntilDue: 5
    },
    {
      id: '2',
      providerName: 'Maria Santos - Técnica',
      amount: 1800.00,
      dueDate: '2024-01-28',
      status: 'overdue',
      daysUntilDue: -2
    },
    {
      id: '3',
      providerName: 'Tech Solutions Ltd',
      amount: 3200.00,
      dueDate: '2024-02-05',
      status: 'pending',
      daysUntilDue: 9
    },
    {
      id: '4',
      providerName: 'Carlos Oliveira',
      amount: 800.00,
      dueDate: '2024-02-10',
      status: 'pending',
      daysUntilDue: 14
    }
  ];

  const getStatusColor = (status: string, daysUntilDue: number) => {
    if (status === 'overdue' || daysUntilDue < 0) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (daysUntilDue <= 3) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string, daysUntilDue: number) => {
    if (status === 'overdue' || daysUntilDue < 0) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (daysUntilDue <= 3) {
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

  const totalUpcoming = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const overduePayments = upcomingPayments.filter(p => p.daysUntilDue < 0);
  const urgentPayments = upcomingPayments.filter(p => p.daysUntilDue >= 0 && p.daysUntilDue <= 3);

  return (
    <div className="space-y-6">
      {/* Resumo do Calendário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-lg font-semibold text-blue-800">{upcomingPayments.length} pagamentos</p>
              <p className="text-sm text-blue-600">
                R$ {totalUpcoming.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Pagamentos Próximos */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Próximos Pagamentos</h4>
        <div className="space-y-3">
          {upcomingPayments.map((payment) => (
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
                    {getUrgencyText(payment.daysUntilDue)}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Ver</Button>
                  <Button 
                    size="sm" 
                    className={
                      payment.daysUntilDue < 0 || payment.daysUntilDue <= 3
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    Pagar Agora
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
