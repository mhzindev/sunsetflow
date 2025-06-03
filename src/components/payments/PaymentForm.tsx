
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { ProviderSelector } from './ProviderSelector';

interface PaymentFormProps {
  onSubmit?: (payment: any) => void;
  onCancel?: () => void;
}

export const PaymentForm = ({ onSubmit, onCancel }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [formData, setFormData] = useState({
    provider_id: '',
    provider_name: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    status: 'pending',
    type: 'full',
    description: '',
    notes: ''
  });

  const { insertPayment } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  const handleProviderSelect = (provider: any) => {
    console.log('Prestador selecionado:', provider);
    setSelectedProvider(provider);
    setFormData(prev => ({
      ...prev,
      provider_id: provider.id,
      provider_name: provider.name,
      description: `Pagamento para ${provider.name} - ${provider.service}`
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.provider_name.trim()) {
      errors.push('Prestador de serviço é obrigatório');
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push('Valor deve ser maior que zero');
    }
    
    if (!formData.due_date) {
      errors.push('Data de vencimento é obrigatória');
    }
    
    if (!formData.description.trim()) {
      errors.push('Descrição é obrigatória');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== INÍCIO DA SUBMISSÃO ===');
    console.log('Dados do formulário:', formData);
    
    // Validação completa do formulário
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.error('Erros de validação:', validationErrors);
      showError('Erro de Validação', validationErrors.join(', '));
      return;
    }

    // Validação adicional do valor
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      console.error('Valor inválido:', formData.amount);
      showError('Valor Inválido', 'Por favor, insira um valor numérico válido maior que zero');
      return;
    }

    // Validação da data
    if (!formData.due_date) {
      console.error('Data de vencimento não informada');
      showError('Data Obrigatória', 'Data de vencimento é obrigatória');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados do pagamento de forma mais robusta
      const paymentData = {
        // IDs e referências
        provider_id: formData.provider_id || null,
        provider_name: formData.provider_name.trim(),
        
        // Valores monetários
        amount: Number(amount.toFixed(2)), // Garantir precisão decimal
        
        // Datas
        due_date: formData.due_date,
        payment_date: formData.payment_date || null,
        
        // Status e tipo
        status: formData.status,
        type: formData.type,
        
        // Textos
        description: formData.description.trim(),
        notes: formData.notes?.trim() || null,
        
        // Campos opcionais inicializados como null
        tags: null,
        installments: null,
        current_installment: null,
        account_id: null,
        account_type: null
      };

      console.log('=== DADOS PREPARADOS PARA ENVIO ===');
      console.log('Payload final:', JSON.stringify(paymentData, null, 2));
      
      // Verificação final antes do envio
      if (!paymentData.provider_name || !paymentData.description || !paymentData.due_date || !paymentData.amount) {
        throw new Error('Dados obrigatórios em branco após preparação');
      }
      
      console.log('=== ENVIANDO PARA SUPABASE ===');
      const { data, error } = await insertPayment(paymentData);
      
      if (error) {
        console.error('=== ERRO RETORNADO DO SUPABASE ===');
        console.error('Tipo do erro:', typeof error);
        console.error('Erro completo:', error);
        
        let errorMessage = 'Erro desconhecido ao criar pagamento';
        
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.details) {
          errorMessage = error.details;
        }
        
        console.error('Mensagem de erro final:', errorMessage);
        showError('Erro ao Criar Pagamento', errorMessage);
        return;
      }

      console.log('=== PAGAMENTO CRIADO COM SUCESSO ===');
      console.log('Dados retornados:', data);
      
      showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      
      // Reset do formulário
      setFormData({
        provider_id: '',
        provider_name: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        payment_date: '',
        status: 'pending',
        type: 'full',
        description: '',
        notes: ''
      });
      setSelectedProvider(null);
      
      // Chamar callback se fornecido
      if (onSubmit) {
        onSubmit(data);
      }
      
    } catch (error) {
      console.error('=== ERRO INESPERADO ===');
      console.error('Erro capturado:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      let errorMessage = 'Falha inesperada na criação do pagamento';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showError('Erro Inesperado', errorMessage);
    } finally {
      setLoading(false);
      console.log('=== FIM DA SUBMISSÃO ===');
    }
  };

  // Verificar se o formulário é válido para habilitar/desabilitar o botão
  const isFormValid = 
    formData.provider_name.trim() && 
    formData.amount && 
    parseFloat(formData.amount) > 0 && 
    formData.due_date && 
    formData.description.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="provider">Prestador de Serviço *</Label>
            <ProviderSelector
              value={formData.provider_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, provider_id: value }))}
              onProviderSelect={handleProviderSelect}
              placeholder="Selecionar prestador"
            />
            {!formData.provider_name && (
              <p className="text-sm text-red-500 mt-1">Prestador de serviço é obrigatório</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
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
              {formData.amount && parseFloat(formData.amount) <= 0 && (
                <p className="text-sm text-red-500 mt-1">Valor deve ser maior que zero</p>
              )}
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Pagamento Completo</SelectItem>
                  <SelectItem value="installment">Parcela</SelectItem>
                  <SelectItem value="advance">Adiantamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do pagamento"
              required
            />
            {!formData.description.trim() && (
              <p className="text-sm text-red-500 mt-1">Descrição é obrigatória</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !isFormValid} 
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar Pagamento'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
