
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, DollarSign, User, Briefcase } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  paymentMethod: string;
  active: boolean;
  totalPaid: number;
  lastPayment: string;
}

interface ProviderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onEdit: (provider: Provider) => void;
  onPay: (provider: Provider) => void;
}

export const ProviderViewModal = ({ 
  isOpen, 
  onClose, 
  provider, 
  onEdit, 
  onPay 
}: ProviderViewModalProps) => {
  const { data } = useFinancial();

  if (!provider) return null;

  const getProviderPayments = () => {
    return data.payments.filter(p => p.providerId === provider.id);
  };

  const getPendingBalance = () => {
    return data.payments
      .filter(p => p.providerId === provider.id && p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      pix: 'PIX',
      transfer: 'Transferência',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const providerPayments = getProviderPayments();
  const pendingBalance = getPendingBalance();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Prestador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Informações Básicas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="text-sm mt-1">{provider.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Serviço</label>
                <p className="text-sm mt-1">{provider.service}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3 text-gray-500" />
                  <p className="text-sm">{provider.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Telefone</label>
                <div className="flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <p className="text-sm">{provider.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Forma de Pagamento</label>
                <p className="text-sm mt-1">{getPaymentMethodLabel(provider.paymentMethod)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge variant={provider.active ? 'default' : 'secondary'}>
                    {provider.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Resumo Financeiro
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Pago</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {(provider.totalPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Saldo Pendente</p>
                <p className="text-lg font-bold text-red-600">
                  R$ {(pendingBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total de Pagamentos</p>
                <p className="text-lg font-bold text-blue-600">{providerPayments.length}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Último Pagamento:</span>
                <span className="text-sm font-medium">
                  {provider.lastPayment ? new Date(provider.lastPayment).toLocaleDateString('pt-BR') : 'Nenhum pagamento'}
                </span>
              </div>
            </div>
          </Card>

          {/* Histórico de Pagamentos Recentes */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4">Últimos Pagamentos</h4>
            <div className="space-y-2">
              {providerPayments.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{payment.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      R$ {(payment.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge 
                      variant={payment.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {payment.status === 'completed' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
              {providerPayments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pagamento registrado
                </p>
              )}
            </div>
          </Card>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => onEdit(provider)}
              variant="outline"
              className="flex-1"
            >
              Editar
            </Button>
            <Button 
              onClick={() => onPay(provider)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Realizar Pagamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
