
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Payment, PaymentStatus, PaymentType } from '@/types/payment';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

interface PaymentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSave: (payment: Payment) => void;
}

export const PaymentEditModal = ({ isOpen, onClose, payment, onSave }: PaymentEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const { updatePayment, updatePaymentStatus } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    status: 'pending' as PaymentStatus,
    type: 'full' as PaymentType,
    description: '',
    notes: '',
    installments: '',
    currentInstallment: ''
  });

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
        currentInstallment: payment.currentInstallment?.toString() || ''
      });
    }
  }, [payment]);

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

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updates: Partial<Payment> = {
        amount,
        dueDate: formData.dueDate,
        type: formData.type,
        description: formData.description,
        notes: formData.notes,
        installments: formData.installments ? parseInt(formData.installments) : undefined,
        currentInstallment: formData.currentInstallment ? parseInt(formData.currentInstallment) : undefined,
      };

      // Se o status mudou, usar updatePaymentStatus para garantir integração
      if (formData.status !== payment?.status) {
        updatePaymentStatus(payment!.id, formData.status);
        updates.paymentDate = formData.status === 'completed' ? new Date().toISOString().split('T')[0] : payment?.paymentDate;
      }

      // Atualizar outros campos
      updatePayment(payment!.id, updates);

      const updatedPayment: Payment = {
        ...payment!,
        ...updates,
        status: formData.status
      };

      onSave(updatedPayment);
      showSuccess('Sucesso', 'Pagamento atualizado com sucesso!');
      onClose();
    } catch (error) {
      showError('Erro', 'Erro ao atualizar pagamento. Tente novamente.');
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
                <SelectItem value="partial">Parcial</SelectItem>
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
