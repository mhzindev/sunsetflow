
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
    setSelectedProvider(provider);
    setFormData(prev => ({
      ...prev,
      provider_id: provider.id,
      provider_name: provider.name,
      description: `Pagamento para ${provider.name} - ${provider.service}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider_id || !formData.amount || !formData.description) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      console.log('Criando pagamento:', paymentData);
      
      const { data, error } = await insertPayment(paymentData);
      
      if (error) {
        console.error('Erro ao criar pagamento:', error);
        showError('Erro', `Erro ao criar pagamento: ${error}`);
        return;
      }

      console.log('Pagamento criado com sucesso:', data);
      showSuccess('Sucesso', 'Pagamento registrado com sucesso!');
      
      // Reset form
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
      
      onSubmit?.(data);
    } catch (error) {
      console.error('Erro inesperado ao criar pagamento:', error);
      showError('Erro', 'Erro inesperado ao criar pagamento');
    } finally {
      setLoading(false);
    }
  };

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Pagamento'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
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
