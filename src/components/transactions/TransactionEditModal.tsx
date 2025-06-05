
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  employeeName: string;
  receipt?: string;
  tags?: string[];
  method: string;
}

interface TransactionEditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onTransactionUpdated: () => void;
}

export const TransactionEditModal = ({ 
  transaction, 
  isOpen, 
  onClose, 
  onTransactionUpdated 
}: TransactionEditModalProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: '',
    method: '',
    date: '',
    status: 'completed' as 'pending' | 'completed' | 'cancelled',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        method: transaction.method,
        date: transaction.date,
        status: transaction.status,
        tags: transaction.tags?.join(', ') || ''
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setLoading(true);
    try {
      // Atualizar transação usando SQL direto
      const { error } = await supabase
        .from('transactions')
        .update({
          description: formData.description,
          amount: formData.amount,
          category: formData.category,
          method: formData.method,
          date: formData.date,
          status: formData.status,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (error) {
        console.error('Erro ao atualizar transação:', error);
        showError('Erro', 'Não foi possível atualizar a transação');
        return;
      }

      showSuccess('Sucesso', 'Transação atualizada com sucesso!');
      onTransactionUpdated();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar transação:', err);
      showError('Erro', 'Erro inesperado ao atualizar transação');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  const categories = [
    { value: 'service_payment', label: 'Pagamento de Serviços' },
    { value: 'client_payment', label: 'Recebimento de Cliente' },
    { value: 'fuel', label: 'Combustível' },
    { value: 'accommodation', label: 'Hospedagem' },
    { value: 'meals', label: 'Alimentação' },
    { value: 'materials', label: 'Materiais' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'office_expense', label: 'Despesa de Escritório' },
    { value: 'other', label: 'Outros' }
  ];

  const methods = [
    { value: 'pix', label: 'PIX' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'cash', label: 'Dinheiro' }
  ];

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
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => 
                setFormData({...formData, category: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="method">Forma de Pagamento *</Label>
              <Select value={formData.method} onValueChange={(value) => 
                setFormData({...formData, method: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'pending' | 'completed' | 'cancelled') => 
              setFormData({...formData, status: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
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
        </form>
      </DialogContent>
    </Dialog>
  );
};
