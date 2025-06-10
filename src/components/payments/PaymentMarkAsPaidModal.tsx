
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
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { getCurrentDate } from '@/utils/dateUtils';

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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { fetchBankAccounts, fetchCreditCards, updatePayment } = useSupabaseData();
  const { updatePaymentStatus } = useFinancialSimplified();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    if (isOpen) {
      loadAccountsAndCards();
      setSelectedAccount(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Verificar se o pagamento já tem conta vinculada
  useEffect(() => {
    if (payment && payment.account_id && payment.account_type) {
      console.log('PaymentMarkAsPaidModal: Pagamento já tem conta vinculada:', {
        account_id: payment.account_id,
        account_type: payment.account_type
      });
      setSelectedAccount({
        id: payment.account_id,
        type: payment.account_type
      });
    }
  }, [payment]);

  const loadAccountsAndCards = async () => {
    try {
      console.log('PaymentMarkAsPaidModal: Carregando contas e cartões...');
      const [accountsData, cardsData] = await Promise.all([
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      setAccounts(accountsData);
      setCards(cardsData);
      console.log('PaymentMarkAsPaidModal: Contas carregadas:', accountsData.length, 'Cartões carregados:', cardsData.length);
    } catch (error) {
      console.error('PaymentMarkAsPaidModal: Erro ao carregar contas e cartões:', error);
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

  const isAccountLinked = () => {
    return selectedAccount !== null && selectedAccount.id && selectedAccount.type;
  };

  const handleMarkAsPaid = async () => {
    // Verificação aprimorada de conta vinculada
    if (isProcessing || !payment) {
      return;
    }

    if (!isAccountLinked()) {
      showError('Erro', 'Selecione uma conta ou cartão para processar o pagamento');
      return;
    }

    setLoading(true);
    setIsProcessing(true);
    
    try {
      console.log('PaymentMarkAsPaidModal: Marcando como pago - OPERAÇÃO ÚNICA');
      console.log('Payment ID:', payment.id);
      console.log('Account:', selectedAccount);

      // Validação do ID do pagamento
      if (!payment.id || payment.id.trim().length === 0) {
        showError('Erro', 'ID do pagamento é inválido');
        return;
      }

      // Usar data atual do timezone de Brasília
      const currentBrasiliaDate = getCurrentDate();
      console.log('PaymentMarkAsPaidModal: Data atual Brasília:', currentBrasiliaDate);

      // Preparar updates
      const updates = {
        status: 'completed' as const,
        payment_date: currentBrasiliaDate,
        account_id: selectedAccount!.id,
        account_type: selectedAccount!.type
      };

      console.log('PaymentMarkAsPaidModal: Enviando updates:', updates);

      // Atualizar pagamento uma única vez
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

      // Atualizar contexto
      updatePaymentStatus(payment.id, 'completed');

      const updatedPayment: Payment = {
        ...payment,
        status: 'completed',
        paymentDate: currentBrasiliaDate,
        account_id: selectedAccount!.id,
        account_type: selectedAccount!.type
      };

      showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      onSuccess(updatedPayment);
      onClose();
    } catch (error) {
      console.error('PaymentMarkAsPaidModal: Erro inesperado:', error);
      showError('Erro', 'Erro inesperado ao processar pagamento');
    } finally {
      setLoading(false);
      setIsProcessing(false);
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
                {isAccountLinked() && (
                  <p className="text-green-600"><strong>✓ Conta vinculada</strong></p>
                )}
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
              disabled={loading || !isAccountLinked() || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading || isProcessing}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
