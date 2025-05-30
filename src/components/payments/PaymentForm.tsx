
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentType } from '@/types/payment';

export const PaymentForm = () => {
  const [formData, setFormData] = useState({
    providerId: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'full' as PaymentType,
    description: '',
    installments: 1,
    notes: ''
  });

  const mockProviders = [
    { id: '1', name: 'João Silva - Técnico' },
    { id: '2', name: 'Maria Santos - Técnica' },
    { id: '3', name: 'Tech Solutions Ltd' },
    { id: '4', name: 'Carlos Oliveira - Freelancer' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payment scheduled:', formData);
  };

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Agendar Novo Pagamento</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="provider">Prestador de Serviço</Label>
            <select
              id="provider"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.providerId}
              onChange={(e) => setFormData({...formData, providerId: e.target.value})}
              required
            >
              <option value="">Selecione um prestador</option>
              {mockProviders.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Valor Total (R$)</Label>
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
            <Label htmlFor="dueDate">Data de Vencimento</Label>
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
          <Label htmlFor="description">Descrição do Serviço</Label>
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
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Agendar Pagamento
          </Button>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};
