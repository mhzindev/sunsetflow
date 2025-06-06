import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProviderSelector } from './ProviderSelector';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { canCreatePayments } from '@/utils/authUtils';
import { PaymentStatus, PaymentType, PAYMENT_STATUS_VALUES, PAYMENT_TYPE_VALUES } from '@/types/payment';
import { getCurrentDateForInput } from '@/utils/dateUtils';
import { ShieldX } from 'lucide-react';

export const PaymentForm = () => {
  const { profile } = useAuth();
  
  // Verificar permissões de acesso
  if (!canCreatePayments(profile)) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <ShieldX className="w-16 h-16 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Acesso Restrito</h3>
            <p className="text-red-600 mt-2">
              Você não tem permissão para criar pagamentos.
              Esta funcionalidade é restrita apenas para administradores.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const [formData, setFormData] = useState({
    provider_id: '',
    provider_name: '',
    amount: '',
    due_date: getCurrentDateForInput(),
    payment_date: '',
    status: PAYMENT_STATUS_VALUES.PENDING as PaymentStatus,
    type: PAYMENT_TYPE_VALUES.FULL as PaymentType,
    description: '',
    installments: '',
    current_installment: '',
    tags: '',
    notes: '',
    account_id: '',
    account_type: null as 'bank_account' | 'credit_card' | null
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);

  const { insertPayment, fetchBankAccounts, fetchCreditCards } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadAccountsAndCards();
  }, []);

  const loadAccountsAndCards = async () => {
    try {
      console.log('PaymentForm: Carregando contas e cartões...');
      const [accountsData, cardsData] = await Promise.all([
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      setAccounts(accountsData);
      setCards(cardsData);
      console.log('PaymentForm: Contas carregadas:', accountsData.length, 'Cartões carregados:', cardsData.length);
    } catch (error) {
      console.error('PaymentForm: Erro ao carregar contas e cartões:', error);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.provider_name.trim()) {
      errors.push('Nome do prestador é obrigatório');
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push('Valor deve ser maior que zero');
    }
    
    if (!formData.description.trim()) {
      errors.push('Descrição é obrigatória');
    }
    
    if (!formData.due_date) {
      errors.push('Data de vencimento é obrigatória');
    }

    // Validações específicas para tipos de pagamento
    if (formData.type === 'installment') {
      if (!formData.installments || parseInt(formData.installments) <= 0) {
        errors.push('Número de parcelas deve ser maior que zero para pagamentos parcelados');
      }
      if (!formData.current_installment || parseInt(formData.current_installment) <= 0) {
        errors.push('Parcela atual deve ser maior que zero para pagamentos parcelados');
      }
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
      console.log('PaymentForm: Iniciando criação de pagamento (tentativa:', submitAttempts + 1, ')');
      console.log('PaymentForm: Dados do formulário:', formData);

      const paymentData = {
        provider_id: formData.provider_id || undefined,
        provider_name: formData.provider_name.trim(),
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        payment_date: formData.payment_date || undefined,
        status: formData.status,
        type: formData.type,
        description: formData.description.trim(),
        installments: formData.installments ? parseInt(formData.installments) : undefined,
        current_installment: formData.current_installment ? parseInt(formData.current_installment) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
        notes: formData.notes.trim() || undefined,
        account_id: formData.account_id || undefined,
        account_type: formData.account_type
      };

      console.log('PaymentForm: Dados processados para envio:', paymentData);
      
      const { data, error } = await insertPayment(paymentData);
      
      if (error) {
        console.error('PaymentForm: Erro retornado pela API:', error);
        
        // Tratamento específico de erros conhecidos
        if (error.includes('does not exist')) {
          showError('Erro de Sistema', 'Função de pagamento não encontrada. Por favor, contate o administrador do sistema.');
        } else if (error.includes('Status inválido') || error.includes('Tipo inválido')) {
          showError('Erro de Validação', `Dados inválidos: ${error}`);
        } else {
          showError('Erro ao Criar Pagamento', `Erro: ${error}`);
        }
        return;
      }

      console.log('PaymentForm: Pagamento criado com sucesso:', data);
      showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      
      // Reset form após sucesso
      setFormData({
        provider_id: '',
        provider_name: '',
        amount: '',
        due_date: getCurrentDateForInput(),
        payment_date: '',
        status: PAYMENT_STATUS_VALUES.PENDING,
        type: PAYMENT_TYPE_VALUES.FULL,
        description: '',
        installments: '',
        current_installment: '',
        tags: '',
        notes: '',
        account_id: '',
        account_type: null
      });
      
      setSubmitAttempts(0);
      
    } catch (error) {
      console.error('PaymentForm: Erro inesperado:', error);
      showError('Erro Inesperado', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: any) => {
    console.log('PaymentForm: Prestador selecionado:', provider);
    setFormData(prev => ({
      ...prev,
      provider_id: provider.id,
      provider_name: provider.name
    }));
  };

  const handleAccountChange = (value: string) => {
    console.log('PaymentForm: Conta selecionada:', value);
    
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

  const isProviderPayment = formData.type === 'balance_payment' || formData.type === 'advance_payment';

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Novo Pagamento</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Prestador de Serviço *</Label>
            <ProviderSelector
              onProviderSelect={handleProviderSelect}
              selectedProvider={formData.provider_name}
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo de Pagamento *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: PaymentType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Pagamento Integral</SelectItem>
                <SelectItem value="installment">Parcelado</SelectItem>
                <SelectItem value="advance">Adiantamento Geral</SelectItem>
                <SelectItem value="balance_payment">Pagamento de Saldo</SelectItem>
                <SelectItem value="advance_payment">Adiantamento de Prestador</SelectItem>
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

        {isProviderPayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Atenção:</strong> Este é um pagamento específico para prestador. 
              {formData.type === 'balance_payment' 
                ? ' O valor será deduzido do saldo do prestador automaticamente.'
                : ' Este adiantamento será registrado no histórico do prestador.'
              }
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_date">Data de Pagamento</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: PaymentStatus) => 
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
                <SelectItem value="overdue">Em Atraso</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
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
        </div>

        {formData.type === 'installment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="installments">Número de Parcelas *</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                value={formData.installments}
                onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))}
                placeholder="Ex: 12"
                required={formData.type === 'installment'}
              />
            </div>

            <div>
              <Label htmlFor="current_installment">Parcela Atual *</Label>
              <Input
                id="current_installment"
                type="number"
                min="1"
                value={formData.current_installment}
                onChange={(e) => setFormData(prev => ({ ...prev, current_installment: e.target.value }))}
                placeholder="Ex: 1"
                required={formData.type === 'installment'}
              />
            </div>
          </div>
        )}

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
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observações adicionais"
            rows={3}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Salvando...' : 'Salvar Pagamento'}
          </Button>
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
