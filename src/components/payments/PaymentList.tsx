
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export const PaymentList = () => {
  const mockPayments = [
    {
      id: '1',
      providerId: '1',
      providerName: 'João Silva - Técnico',
      amount: 2500.00,
      dueDate: '2024-02-01',
      status: 'pending',
      type: 'full',
      description: 'Serviços de instalação Janeiro/2024',
      installments: 1,
      currentInstallment: 1
    },
    {
      id: '2',
      providerId: '2',
      providerName: 'Maria Santos - Técnica',
      amount: 1800.00,
      dueDate: '2024-01-28',
      status: 'overdue',
      type: 'installment',
      description: 'Serviços de manutenção',
      installments: 3,
      currentInstallment: 2
    },
    {
      id: '3',
      providerId: '3',
      providerName: 'Tech Solutions Ltd',
      amount: 500.00,
      dueDate: '2024-01-20',
      paymentDate: '2024-01-20',
      status: 'completed',
      type: 'advance',
      description: 'Adiantamento para projeto especial',
      installments: 1,
      currentInstallment: 1
    },
    {
      id: '4',
      providerId: '1',
      providerName: 'João Silva - Técnico',
      amount: 1200.00,
      dueDate: '2024-02-05',
      status: 'partial',
      type: 'installment',
      description: 'Pagamento parcial de serviços',
      installments: 2,
      currentInstallment: 1
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      partial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      overdue: 'Em Atraso',
      completed: 'Concluído',
      partial: 'Parcial',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || 'Pendente';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      full: 'Integral',
      installment: 'Parcelado',
      advance: 'Adiantamento'
    };
    return labels[type as keyof typeof labels] || 'Integral';
  };

  const isDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due <= today;
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-lg font-semibold">R$ 3.700,00</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Em Atraso</p>
              <p className="text-lg font-semibold">R$ 1.800,00</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Pagos (30 dias)</p>
              <p className="text-lg font-semibold">R$ 12.500,00</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Parciais</p>
              <p className="text-lg font-semibold">R$ 1.200,00</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Lista de Pagamentos</h4>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Filtrar</Button>
            <Button variant="outline" size="sm">Exportar</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prestador</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.id} className={isDue(payment.dueDate) && payment.status === 'pending' ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">{payment.providerName}</TableCell>
                <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                <TableCell className="font-semibold">
                  R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span className={isDue(payment.dueDate) && payment.status === 'pending' ? 'text-red-600 font-medium' : ''}>
                      {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeLabel(payment.type)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusLabel(payment.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.installments > 1 ? 
                    `${payment.currentInstallment}/${payment.installments}` : 
                    'À vista'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">Ver</Button>
                    {payment.status === 'pending' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Pagar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
