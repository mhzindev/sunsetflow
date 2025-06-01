
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentType } from '@/types/payment';
import { useFinancial } from '@/contexts/FinancialContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const PaymentForm = () => {
  const { addPayment } = useFinancial();
  const { showSuccess, showError } = useToastFeedback();
  const { fetchServiceProviders } = useSupabaseData();
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    providerId: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'full' as PaymentType,
    description: '',
    installments: 1,
    notes: ''
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const providersData = await fetchServiceProviders();
      setProviders(providersData);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      showError('Erro', 'Erro ao carregar lista de fornecedores');
    }
  };

  const resetForm = () => {
    setFormData({
      providerId: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      type: 'full',
      description: '',
      installments: 1,
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.providerId || !formData.amount || !formData.description) {
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
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedProvider = providers.find(p => p.id === formData.providerId);
      
      if (formData.type === 'installment' && formData.installments > 1) {
        // Criar múltiplos pagamentos para parcelamento
        const installmentAmount = amount / formData.installments;
        const baseDate = new Date(formData.dueDate);
        
        for (let i = 0; i < formData.installments; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          
          const paymentData = {
            providerId: formData.providerId,
            providerName: selectedProvider?.name || 'Prestador Desconhecido',
            amount: installmentAmount,
            dueDate: installmentDate.toISOString().split('T')[0],
            status: 'pending' as const,
            type: formData.type,
            description: `${formData.description} (Parcela ${i + 1}/${formData.installments})`,
            installments: formData.installments,
            currentInstallment: i + 1,
            notes: formData.notes
          };
          
          addPayment(paymentData);
        }
        
        showSuccess(
          'Pagamentos Agendados', 
          `${formData.installments} parcelas de R$ ${installmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} agendadas com sucesso!`
        );
      } else {
        // Pagamento único
        const paymentData = {
          providerId: formData.providerId,
          providerName: selectedProvider?.name || 'Prestador Desconhecido',
          amount: amount,
          dueDate: formData.dueDate,
          status: 'pending' as const,
          type: formData.type,
          description: formData.description,
          notes: formData.notes
        };
        
        addPayment(paymentData);
        
        showSuccess(
          'Pagamento Agendado', 
          `Pagamento de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} agendado para ${new Date(formData.dueDate).toLocaleDateString('pt-BR')}!`
        );
      }
      
      resetForm();
    } catch (error) {
      showError('Erro', 'Erro ao agendar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    showSuccess('Cancelado', 'Formulário limpo com sucesso');
  };

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Agendar Novo Pagamento</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="provider">Prestador de Serviço *</Label>
            <select
              id="provider"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.providerId}
              onChange={(e) => setFormData({...formData, providerId: e.target.value})}
              required
            >
              <option value="">Selecione um prestador</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} - {provider.service}
                </option>
              ))}
            </select>
            {providers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhum prestador encontrado. Cadastre um prestador primeiro.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Valor Total (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label>Tipo de Pagamento</Label>
          <div className="flex space-x-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="full"
                checked={formData.type === 'full'}
                onChange={(e) => setFormData({...formData, type: e.target.value as PaymentType})}
              />
              <span>Pagamento Integral</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="installment"
                checked={formData.type === 'installment'}
                onChange={(e) => setFormData({...formData, type: e.target.value as PaymentType})}
              />
              <span>Parcelado</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="type"
                value="advance"
                checked={formData.type === 'advance'}
                onChange={(e) => setFormData({...formData, type: e.target.value as PaymentType})}
              />
              <span>Adiantamento</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {formData.type === 'installment' && (
            <div>
              <Label htmlFor="installments">Número de Parcelas</Label>
              <Input
                id="installments"
                type="number"
                min="2"
                max="12"
                value={formData.installments}
                onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value)})}
                required
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrição do Serviço *</Label>
          <Textarea
            id="description"
            placeholder="Descreva o serviço prestado..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="notes">Observações (Opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Observações adicionais..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading || providers.length === 0}
          >
            {isLoading ? 'Agendando...' : 'Agendar Pagamento'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};
