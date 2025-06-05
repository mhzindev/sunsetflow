
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { ServiceProvider, PaymentType } from '@/types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider;
  paymentType: 'balance_payment' | 'advance_payment';
  onSuccess: () => void;
}

export const PaymentModal = ({ 
  isOpen, 
  onOpenChange, 
  provider, 
  paymentType, 
  onSuccess 
}: PaymentModalProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
    account_id: '',
    account_type: null as 'bank_account' | 'credit_card' | null
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { insertPayment, fetchBankAccounts, fetchCreditCards } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    if (isOpen) {
      loadAccountsAndCards();
      // Definir valor padrão baseado no tipo de pagamento
      if (paymentType === 'balance_payment' && provider.currentBalance) {
        setFormData(prev => ({
          ...prev,
          amount: provider.currentBalance.toString(),
          description: `Pagamento do saldo completo - ${provider.name}`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          amount: '',
          description: `Adiantamento para ${provider.name}`
        }));
      }
    }
  }, [isOpen, paymentType, provider]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      showError('Erro', 'O valor deve ser maior que zero');
      return;
    }

    // Validação para pagamento de saldo
    if (paymentType === 'balance_payment' && provider.currentBalance && amount > provider.currentBalance) {
      showError('Erro', 'O valor não pode ser maior que o saldo atual');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        provider_id: provider.id,
        provider_name: provider.name,
        amount: amount,
        due_date: formData.payment_date,
        payment_date: formData.payment_date,
        status: 'completed' as const,
        type: paymentType as PaymentType,
        description: formData.description,
        notes: formData.notes || undefined,
        account_id: formData.account_id || undefined,
        account_type: formData.account_type
      };

      console.log('Criando pagamento de prestador:', paymentData);
      
      const { data, error } = await insertPayment(paymentData);
      
      if (error) {
        console.error('Erro ao criar pagamento:', error);
        showError('Erro', `Erro ao registrar pagamento: ${error}`);
        return;
      }

      console.log('Pagamento registrado com sucesso:', data);
      onSuccess();
    } catch (error) {
      console.error('Erro inesperado:', error);
      showError('Erro', 'Erro inesperado ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (value: string) => {
    if (value === 'none') {
      setFormData(prev => ({
        ...prev,
        account_id: '',
        account_type: null
      }));
      return;
    }

    const [type, id] = value.split(':');
    setFormData(prev => ({
      ...prev,
      account_id: id,
      account_type: type as 'bank_account' | 'credit_card'
    }));
  };

  const getAccountValue = () => {
    if (!formData.account_id || !formData.account_type) {
      return 'none';
    }
    return `${formData.account_type}:${formData.account_id}`;
  };

  const getModalTitle = () => {
    return paymentType === 'balance_payment' 
      ? `Pagar Saldo - ${provider.name}`
      : `Adiantamento - ${provider.name}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {paymentType === 'balance_payment' && provider.currentBalance && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Saldo atual:</strong> {formatCurrency(provider.currentBalance)}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_date">Data do Pagamento *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="account">Conta/Cartão</Label>
            <Select value={getAccountValue()} onValueChange={handleAccountChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar conta ou cartão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma conta selecionada</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={`bank_account:${account.id}`}>
                    {account.name} - {account.bank}
                  </SelectItem>
                ))}
                {cards.map((card) => (
                  <SelectItem key={card.id} value={`credit_card:${card.id}`}>
                    {card.name} - {card.brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do pagamento"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processando...' : 'Registrar Pagamento'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
