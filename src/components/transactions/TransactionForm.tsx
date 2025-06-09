
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReceiptUpload } from "@/components/common/ReceiptUpload";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentDateForInput } from '@/utils/dateUtils';

type TransactionCategory = 'service_payment' | 'client_payment' | 'fuel' | 'accommodation' | 'meals' | 'materials' | 'maintenance' | 'office_expense' | 'other';
type PaymentMethod = 'pix' | 'transfer' | 'credit_card' | 'debit_card' | 'cash';

interface TransactionFormProps {
  onClose?: () => void;
  onSubmit?: (transaction: any) => void;
}

export const TransactionForm = ({ onClose, onSubmit }: TransactionFormProps) => {
  const { profile } = useAuth();
  const { insertTransaction, fetchBankAccounts, fetchCreditCards } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();
  
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    description: '',
    amount: '',
    category: 'other' as TransactionCategory,
    method: 'pix' as PaymentMethod,
    date: getCurrentDateForInput(),
    account_id: '',
    account_type: null as 'bank_account' | 'credit_card' | null,
    tags: '',
    receipt: ''
  });

  useEffect(() => {
    loadAccountsAndCards();
  }, []);

  const loadAccountsAndCards = async () => {
    try {
      console.log('TransactionForm: Carregando contas e cartões...');
      const [accountsData, cardsData] = await Promise.all([
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      setAccounts(accountsData);
      setCards(cardsData);
      console.log('TransactionForm: Contas carregadas:', accountsData.length, 'Cartões carregados:', cardsData.length);
    } catch (error) {
      console.error('TransactionForm: Erro ao carregar contas e cartões:', error);
      showError('Erro', 'Erro ao carregar contas e cartões');
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.description.trim()) {
      errors.push('Descrição é obrigatória');
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push('Valor deve ser maior que zero');
    }
    
    if (!formData.category) {
      errors.push('Categoria é obrigatória');
    }
    
    if (!formData.date) {
      errors.push('Data é obrigatória');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showError('Erro de Validação', validationErrors.join('. '));
      return;
    }

    setLoading(true);
    setSubmitAttempts(prev => prev + 1);
    
    try {
      console.log('TransactionForm: Iniciando criação de transação (tentativa:', submitAttempts + 1, ')');
      console.log('TransactionForm: Dados do formulário:', formData);

      const transactionData = {
        type: formData.type,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        method: formData.method,
        date: formData.date,
        account_id: formData.account_id || null,
        account_type: formData.account_type,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        receipt: formData.receipt.trim() || null,
        user_id: profile?.id,
        user_name: profile?.name || '',
        status: 'completed' as const
      };

      console.log('TransactionForm: Dados processados para envio:', transactionData);
      
      const { data, error } = await insertTransaction(transactionData);
      
      if (error) {
        console.error('TransactionForm: Erro retornado pela API:', error);
        
        // Tratamento específico de erros conhecidos
        if (error.includes('does not exist')) {
          showError('Erro de Sistema', 'Função de transação não encontrada. Por favor, contate o administrador do sistema.');
        } else if (error.includes('inválido')) {
          showError('Erro de Validação', `Dados inválidos: ${error}`);
        } else {
          showError('Erro ao Criar Transação', `Erro: ${error}`);
        }
        return;
      }

      console.log('TransactionForm: Transação criada com sucesso:', data);
      showSuccess('Sucesso', 'Transação registrada com sucesso!');
      
      // Reset form
      setFormData({
        type: 'expense',
        description: '',
        amount: '',
        category: 'other',
        method: 'pix',
        date: getCurrentDateForInput(),
        account_id: '',
        account_type: null,
        tags: '',
        receipt: ''
      });
      
      setSubmitAttempts(0);
      onSubmit?.(data);
      onClose?.();
    } catch (error) {
      console.error('TransactionForm: Erro inesperado:', error);
      showError('Erro Inesperado', 'Ocorreu um erro inesperado ao criar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (value: string) => {
    console.log('TransactionForm: Conta selecionada:', value);
    
    if (value === 'none') {
      setFormData(prev => ({
        ...prev,
        account_id: '',
        account_type: null
      }));
      return;
    }

    const [type, id] = value.split(':');
    console.log('TransactionForm: Dados da conta:', { type, id });
    
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>
      
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
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição da transação"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value: TransactionCategory) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service_payment">Pagamento de Serviço</SelectItem>
                <SelectItem value="client_payment">Pagamento de Cliente</SelectItem>
                <SelectItem value="fuel">Deslocamento</SelectItem>
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
            <Label htmlFor="method">Método de Pagamento *</Label>
            <Select 
              value={formData.method} 
              onValueChange={(value: PaymentMethod) => 
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="account">Conta/Cartão</Label>
            <Select 
              value={getAccountValue()} 
              onValueChange={handleAccountChange}
            >
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
        </div>

        <div>
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <ReceiptUpload
          value={formData.receipt}
          onChange={(url) => setFormData(prev => ({ ...prev, receipt: url || '' }))}
          label="Comprovante"
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Salvando...' : 'Salvar Transação'}
          </Button>
          {onClose && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
        </div>
        
        {submitAttempts > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Tentativas de envio: {submitAttempts}
          </div>
        )}
      </form>
    </Card>
  );
};
