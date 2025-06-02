
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface TransactionFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const TransactionForm = ({ onSave, onCancel }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: 'service_payment' as any,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    method: 'pix' as any,
    account_id: '',
    account_type: '' as 'bank_account' | 'credit_card' | '',
    tags: [] as string[],
    receipt: ''
  });

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { fetchBankAccounts, fetchCreditCards, insertTransaction } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const [accounts, cards] = await Promise.all([
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      setBankAccounts(accounts);
      setCreditCards(cards);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      showError('Erro', 'Erro ao carregar contas e cartões');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        method: formData.method,
        account_id: formData.account_id || null,
        account_type: formData.account_type || null,
        tags: formData.tags,
        receipt: formData.receipt || null,
        status: 'completed' as const
      };

      console.log('Enviando transação:', transactionData);

      const { data, error } = await insertTransaction(transactionData);
      
      if (error) {
        console.error('Erro ao inserir transação:', error);
        showError('Erro', `Erro ao salvar transação: ${error}`);
        return;
      }

      console.log('Transação salva com sucesso:', data);
      showSuccess('Sucesso', 'Transação registrada com sucesso!');
      
      // Reset form
      setFormData({
        type: 'income',
        category: 'service_payment',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        method: 'pix',
        account_id: '',
        account_type: '',
        tags: [],
        receipt: ''
      });

      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      showError('Erro', 'Erro inesperado ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAccountChange = (accountId: string) => {
    const bankAccount = bankAccounts.find(acc => acc.id === accountId);
    const creditCard = creditCards.find(card => card.id === accountId);
    
    if (bankAccount) {
      setFormData(prev => ({
        ...prev,
        account_id: accountId,
        account_type: 'bank_account'
      }));
    } else if (creditCard) {
      setFormData(prev => ({
        ...prev,
        account_id: accountId,
        account_type: 'credit_card'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        account_id: '',
        account_type: ''
      }));
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service_payment">Pagamento de Serviço</SelectItem>
                <SelectItem value="client_payment">Pagamento de Cliente</SelectItem>
                <SelectItem value="fuel">Combustível</SelectItem>
                <SelectItem value="accommodation">Hospedagem</SelectItem>
                <SelectItem value="meals">Alimentação</SelectItem>
                <SelectItem value="materials">Materiais</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="office_expense">Despesa de Escritório</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="method">Método de Pagamento *</Label>
            <Select 
              value={formData.method} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Conta/Cartão</Label>
            <Select 
              value={formData.account_id} 
              onValueChange={handleAccountChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma conta selecionada</SelectItem>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.bank}
                  </SelectItem>
                ))}
                {creditCards.map(card => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name} - {card.brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva a transação..."
            required
          />
        </div>

        <div>
          <Label htmlFor="receipt">Comprovante (URL)</Label>
          <Input
            type="url"
            value={formData.receipt}
            onChange={(e) => setFormData(prev => ({ ...prev, receipt: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nova tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Transação'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};
