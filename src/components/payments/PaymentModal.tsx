
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PaymentMethod } from '@/types/payment';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    name: string;
    service: string;
    paymentMethod: PaymentMethod;
    totalPaid?: number;
  } | null;
}

export const PaymentModal = ({ isOpen, onClose, provider }: PaymentModalProps) => {
  const { addTransaction, addPayment } = useFinancial();
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: provider ? `Pagamento para ${provider.name}` : 'Pagamento',
    method: (provider?.paymentMethod || 'pix') as PaymentMethod,
    notes: ''
  });

  // Don't render if provider is null
  if (!provider) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      description: `Pagamento para ${provider.name}`,
      method: provider.paymentMethod,
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    setIsLoading(true);

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentDate = new Date().toISOString().split('T')[0];

      // Registrar como transação de despesa
      const transactionData = {
        type: 'expense' as const,
        category: 'service_payment' as const,
        amount: amount,
        description: formData.description,
        date: currentDate,
        method: formData.method,
        status: 'completed' as const,
        userId: '1',
        userName: 'Sistema - Pagamento Manual',
        notes: formData.notes
      };

      addTransaction(transactionData);

      // Registrar como pagamento concluído
      const paymentData = {
        providerId: provider.id,
        providerName: provider.name,
        amount: amount,
        dueDate: currentDate,
        status: 'completed' as const,
        type: 'full' as const,
        description: formData.description,
        notes: formData.notes
      };

      addPayment(paymentData);

      showSuccess(
        'Pagamento Registrado', 
        `Pagamento de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ${provider.name} registrado com sucesso!`
      );
      
      resetForm();
      onClose();
    } catch (error) {
      showError('Erro', 'Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      pix: 'PIX',
      transfer: 'Transferência',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro'
    };
    return labels[method];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações do Prestador */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">{provider.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{provider.service}</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {getPaymentMethodLabel(provider.paymentMethod)}
              </Badge>
              <span className="text-sm text-gray-600">
                Total pago: R$ {(provider.totalPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Valor do Pagamento (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="method">Método de Pagamento</Label>
              <select
                id="method"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
              >
                <option value="pix">PIX</option>
                <option value="transfer">Transferência</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="cash">Dinheiro</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre o pagamento..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Registrar Pagamento'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
