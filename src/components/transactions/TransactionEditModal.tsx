
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionCategory, PaymentMethod } from '@/types/transaction';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (transaction: Transaction) => void;
}

export const TransactionEditModal = ({ 
  isOpen, 
  onClose, 
  transaction,
  onSave 
}: TransactionEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: 'fuel' as TransactionCategory,
    method: 'pix' as PaymentMethod,
    status: 'pending' as 'pending' | 'completed' | 'cancelled'
  });

  const categories = [
    { value: 'service_payment', label: 'Pagamento Serviços', color: 'bg-red-100 text-red-800' },
    { value: 'client_payment', label: 'Recebimento Cliente', color: 'bg-green-100 text-green-800' },
    { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800' },
    { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800' },
    { value: 'meals', label: 'Alimentação', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'maintenance', label: 'Manutenção', color: 'bg-purple-100 text-purple-800' },
    { value: 'office_expense', label: 'Despesa Escritório', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800' }
  ];

  const paymentMethods = [
    { value: 'pix', label: 'PIX' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'cash', label: 'Dinheiro' }
  ];

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        category: transaction.category,
        method: transaction.method,
        status: transaction.status
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount) {
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
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!transaction) return;

      const updatedTransaction: Transaction = {
        ...transaction,
        description: formData.description,
        amount: amount,
        date: formData.date,
        category: formData.category,
        method: formData.method,
        status: formData.status
      };
      
      onSave(updatedTransaction);
      showSuccess('Sucesso', 'Transação atualizada com sucesso!');
      onClose();
    } catch (error) {
      showError('Erro', 'Erro ao atualizar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label>Categoria *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(category => (
                <Badge
                  key={category.value}
                  className={`cursor-pointer ${
                    formData.category === category.value 
                      ? 'bg-blue-600 text-white' 
                      : category.color
                  }`}
                  onClick={() => setFormData({...formData, category: category.value as TransactionCategory})}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">Forma de Pagamento *</Label>
              <select
                id="method"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'completed' | 'cancelled'})}
                required
              >
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
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
