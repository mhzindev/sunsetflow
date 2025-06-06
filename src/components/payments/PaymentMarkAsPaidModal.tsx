import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, DollarSign } from 'lucide-react';
import { Payment } from '@/types/payment';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useFinancial } from '@/contexts/FinancialContext';

interface PaymentMarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSuccess: (payment: Payment) => void;
}

export const PaymentMarkAsPaidModal = ({ 
  isOpen, 
  onClose, 
  payment, 
  onSuccess 
}: PaymentMarkAsPaidModalProps) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<{
    id: string;
    type: 'bank_account' | 'credit_card';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { fetchBankAccounts, fetchCreditCards, updatePayment } = useSupabaseData();
  const { updatePaymentStatus } = useFinancial();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    if (isOpen) {
      loadAccountsAndCards();
      setSelectedAccount(null);
    }
  }, [isOpen]);

  const loadAccountsAndCards = async () => {
    try {
      const [accountsData, cardsData] = await Promise.all([
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      setAccounts(accountsData);
      setCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const handleAccountChange = (value: string) => {
    if (value === 'none') {
      setSelectedAccount(null);
      return;
    }

    const [type, id] = value.split(':');
    setSelectedAccount({
      id,
      type: type as 'bank_account' | 'credit_card'
    });
  };

  const getAccountValue = () => {
    if (!selectedAccount) {
      return 'none';
    }
    return `${selectedAccount.type}:${selectedAccount.id}`;
  };

  const handleMarkAsPaid = async () => {
    if (!payment || !selectedAccount) {
      showError('Erro', 'Selecione uma conta ou cartão');
      return;
    }

    setLoading(true);
    try {
      console.log('PaymentMarkAsPaidModal: Iniciando marcação como pago');
      console.log('Payment ID:', payment.id);
      console.log('Account:', selectedAccount);

      // Validação crítica do ID do pagamento
      if (!payment.id || payment.id.trim().length === 0) {
        showError('Erro', 'ID do pagamento é inválido');
        return;
      }

      // Atualizar o pagamento com status completed, data atual e conta selecionada
      const updates = {
        status: 'completed' as const,
        payment_date: new Date().toISOString().split('T')[0],
        account_id: selectedAccount.id,
        account_type: selectedAccount.type
      };

      console.log('PaymentMarkAsPaidModal: Enviando updates:', updates);

      const { data, error } = await updatePayment(payment.id, updates);
      
      if (error) {
        console.error('PaymentMarkAsPaidModal: Erro na atualização:', error);
        showError('Erro', error);
        return;
      }

      if (!data) {
        console.error('PaymentMarkAsPaidModal: Nenhum dado retornado');
        showError('Erro', 'Erro ao processar pagamento');
        return;
      }

      console.log('PaymentMarkAsPaidModal: Pagamento atualizado com sucesso:', data);

      // Atualizar também via contexto para garantir sincronização
      updatePaymentStatus(payment.id, 'completed');

      const updatedPayment: Payment = {
        ...payment,
        status: 'completed',
        paymentDate: updates.payment_date,
        account_id: selectedAccount.id,
        account_type: selectedAccount.type
      };

      showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      onSuccess(updatedPayment);
      onClose();
    } catch (error) {
      console.error('PaymentMarkAsPaidModal: Erro inesperado:', error);
      showError('Erro', 'Erro inesperado ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Marcar como Pago
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Prestador:</strong> {payment.providerName}</p>
                <p><strong>Valor:</strong> {formatCurrency(payment.amount)}</p>
                <p><strong>Descrição:</strong> {payment.description}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="account">Selecionar Conta/Cartão *</Label>
            <Select value={getAccountValue()} onValueChange={handleAccountChange}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha de onde será debitado o valor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" disabled>Selecione uma conta ou cartão</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={`bank_account:${account.id}`}>
                    💳 {account.name} - {account.bank}
                    <span className="text-xs text-gray-500 ml-2">
                      (Saldo: {formatCurrency(account.balance || 0)})
                    </span>
                  </SelectItem>
                ))}
                {cards.map((card) => (
                  <SelectItem key={card.id} value={`credit_card:${card.id}`}>
                    🏦 {card.name} - {card.brand}
                    <span className="text-xs text-gray-500 ml-2">
                      (Disponível: {formatCurrency(card.available_limit || 0)})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              O valor será debitado da conta/cartão selecionado
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleMarkAsPaid}
              disabled={loading || !selectedAccount}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
