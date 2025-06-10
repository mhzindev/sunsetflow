import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { Payment, PaymentStatus, PaymentType } from '@/types/payment';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { getCurrentDate } from '@/utils/dateUtils';

interface PaymentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSave: (payment: Payment) => void;
}

export const PaymentEditModal = ({ isOpen, onClose, payment, onSave }: PaymentEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const { updatePayment: updatePaymentContext, updatePaymentStatus } = useFinancialSimplified();
  const { fetchBankAccounts, fetchCreditCards, updatePayment } = useSupabaseData();
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    status: 'pending' as PaymentStatus,
    type: 'full' as PaymentType,
    description: '',
    notes: '',
    installments: '',
    currentInstallment: '',
    account_id: '',
    account_type: null as 'bank_account' | 'credit_card' | null
  });

  useEffect(() => {
    if (isOpen) {
      loadAccountsAndCards();
    }
  }, [isOpen]);

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount?.toString() || '',
        dueDate: payment.dueDate || '',
        status: payment.status || 'pending',
        type: payment.type || 'full',
        description: payment.description || '',
        notes: payment.notes || '',
        installments: payment.installments?.toString() || '',
        currentInstallment: payment.currentInstallment?.toString() || '',
        account_id: payment.account_id || '',
        account_type: payment.account_type || null
      });
    }
  }, [payment]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.dueDate || !formData.description) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    // Validar conta obrigatória para status completed
    if (formData.status === 'completed' && (!formData.account_id || !formData.account_type)) {
      showError('Conta Obrigatória', 'Para marcar como pago, selecione uma conta ou cartão de onde o valor será debitado');
      return;
    }

    // Validação crítica do ID do pagamento
    if (!payment?.id || payment.id.trim().length === 0) {
      showError('Erro', 'ID do pagamento é inválido');
      return;
    }

    setIsLoading(true);

    try {
      console.log('PaymentEditModal: Iniciando atualização do pagamento');
      console.log('Payment ID:', payment.id);

      const updates: Partial<Payment> = {
        amount,
        dueDate: formData.dueDate,
        type: formData.type,
        description: formData.description,
        notes: formData.notes,
        installments: formData.installments ? parseInt(formData.installments) : undefined,
        currentInstallment: formData.currentInstallment ? parseInt(formData.currentInstallment) : undefined,
        account_id: formData.account_id || undefined,
        account_type: formData.account_type || undefined,
      };

      // Se o status mudou, usar updatePaymentStatus para garantir integração
      if (formData.status !== payment?.status) {
        const paymentDate = formData.status === 'completed' ? getCurrentDate() : payment?.paymentDate;
        updatePaymentStatus(payment!.id, formData.status);
        updates.paymentDate = paymentDate;
      }

      console.log('PaymentEditModal: Enviando updates:', updates);

      // Usar a função segura de atualização
      const { data, error } = await updatePayment(payment.id, updates);

      if (error) {
        console.error('PaymentEditModal: Erro na atualização:', error);
        showError('Erro', error);
        return;
      }

      if (!data) {
        console.error('PaymentEditModal: Nenhum dado retornado');
        showError('Erro', 'Erro ao atualizar pagamento');
        return;
      }

      console.log('PaymentEditModal: Pagamento atualizado com sucesso:', data);

      // Atualizar outros campos via contexto
      updatePaymentContext(payment!.id, updates);

      const updatedPayment: Payment = {
        ...payment!,
        ...updates,
        status: formData.status
      };

      onSave(updatedPayment);
      showSuccess('Sucesso', 'Pagamento atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('PaymentEditModal: Erro inesperado:', error);
      showError('Erro', 'Erro inesperado ao atualizar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pagamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.status === 'completed' && (!formData.account_id || !formData.account_type) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para manter um pagamento como "concluído", é obrigatório selecionar uma conta ou cartão.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Data de Vencimento *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: PaymentStatus) => 
              setFormData({...formData, status: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="overdue">Em Atraso</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Conta/Cartão</Label>
            <Select value={getAccountValue()} onValueChange={handleAccountChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar conta ou cartão (obrigatório para pagamentos concluídos)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma conta selecionada</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={`bank_account:${account.id}`}>
                    💳 {account.name} - {account.bank}
                  </SelectItem>
                ))}
                {cards.map((card) => (
                  <SelectItem key={card.id} value={`credit_card:${card.id}`}>
                    🏦 {card.name} - {card.brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.status === 'completed' && (
              <p className="text-xs text-red-600 mt-1">
                * Obrigatório para pagamentos concluídos
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: PaymentType) => 
              setFormData({...formData, type: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Integral</SelectItem>
                <SelectItem value="installment">Parcelado</SelectItem>
                <SelectItem value="advance">Adiantamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'installment' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installments">Total de Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="2"
                  value={formData.installments}
                  onChange={(e) => setFormData({...formData, installments: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="currentInstallment">Parcela Atual</Label>
                <Input
                  id="currentInstallment"
                  type="number"
                  min="1"
                  value={formData.currentInstallment}
                  onChange={(e) => setFormData({...formData, currentInstallment: e.target.value})}
                />
              </div>
            </div>
          )}

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
              rows={3}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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
      </DialogContent>
    </Dialog>
  );
};
