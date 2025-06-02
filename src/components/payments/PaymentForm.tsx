
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { NewProviderModal } from './NewProviderModal';

interface PaymentFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const PaymentForm = ({ onSave, onCancel }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    provider_id: '',
    provider_name: '',
    amount: '',
    due_date: '',
    payment_date: '',
    status: 'pending' as any,
    type: 'full' as any,
    description: '',
    installments: '',
    current_installment: '',
    tags: [] as string[],
    notes: '',
    account_id: '',
    account_type: '' as 'bank_account' | 'credit_card' | ''
  });

  const [providers, setProviders] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { 
    fetchServiceProviders, 
    fetchBankAccounts, 
    fetchCreditCards, 
    insertPayment 
  } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providersData, accountsData, cardsData] = await Promise.all([
        fetchServiceProviders(),
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      setProviders(providersData);
      setBankAccounts(accountsData);
      setCreditCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Erro ao carregar dados necessários');
    }
  };

  const handleProviderChange = (providerId: string) => {
    if (providerId === 'no-provider') {
      setFormData(prev => ({
        ...prev,
        provider_id: '',
        provider_name: ''
      }));
      return;
    }

    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setFormData(prev => ({
        ...prev,
        provider_id: providerId,
        provider_name: provider.name
      }));
    }
  };

  const handleAccountChange = (accountId: string) => {
    if (accountId === 'no-account') {
      setFormData(prev => ({
        ...prev,
        account_id: '',
        account_type: ''
      }));
      return;
    }

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider_name || !formData.amount || !formData.due_date || !formData.description) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        provider_id: formData.provider_id || null,
        provider_name: formData.provider_name,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        payment_date: formData.payment_date || null,
        status: formData.status,
        type: formData.type,
        description: formData.description,
        installments: formData.installments ? parseInt(formData.installments) : null,
        current_installment: formData.current_installment ? parseInt(formData.current_installment) : null,
        tags: formData.tags,
        notes: formData.notes || null,
        account_id: formData.account_id || null,
        account_type: formData.account_type || null
      };

      console.log('Enviando pagamento:', paymentData);

      const { data, error } = await insertPayment(paymentData);
      
      if (error) {
        console.error('Erro ao inserir pagamento:', error);
        showError('Erro', `Erro ao salvar pagamento: ${error}`);
        return;
      }

      console.log('Pagamento salvo com sucesso:', data);
      showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      
      // Reset form
      setFormData({
        provider_id: '',
        provider_name: '',
        amount: '',
        due_date: '',
        payment_date: '',
        status: 'pending',
        type: 'full',
        description: '',
        installments: '',
        current_installment: '',
        tags: [],
        notes: '',
        account_id: '',
        account_type: ''
      });

      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      showError('Erro', 'Erro inesperado ao salvar pagamento');
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Novo Pagamento</h3>
        <NewProviderModal onProviderCreated={loadData} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="provider">Prestador</Label>
            <Select 
              value={formData.provider_id || 'no-provider'} 
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um prestador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-provider">Prestador não cadastrado</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} - {provider.service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(!formData.provider_id || formData.provider_id === 'no-provider') && (
            <div>
              <Label htmlFor="provider_name">Nome do Prestador *</Label>
              <Input
                value={formData.provider_name}
                onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                placeholder="Digite o nome do prestador"
                required
              />
            </div>
          )}

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
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_date">Data de Pagamento</Label>
            <Input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Tipo de Pagamento *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">À Vista</SelectItem>
                <SelectItem value="installment">Parcelado</SelectItem>
                <SelectItem value="advance">Adiantamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'installment' && (
            <>
              <div>
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input
                  type="number"
                  value={formData.installments}
                  onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))}
                  placeholder="Ex: 12"
                />
              </div>

              <div>
                <Label htmlFor="current_installment">Parcela Atual</Label>
                <Input
                  type="number"
                  value={formData.current_installment}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_installment: e.target.value }))}
                  placeholder="Ex: 1"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="account">Conta/Cartão</Label>
            <Select 
              value={formData.account_id || 'no-account'} 
              onValueChange={handleAccountChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-account">Nenhuma conta selecionada</SelectItem>
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
            placeholder="Descreva o pagamento..."
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observações adicionais..."
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
            {loading ? 'Salvando...' : 'Salvar Pagamento'}
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
