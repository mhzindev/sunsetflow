
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface ExpenseFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const ExpenseForm = ({ onSave, onCancel }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    mission_id: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_advanced: false,
    receipt: '',
    // Campos específicos para deslocamento
    travel_km: '',
    travel_km_rate: '',
    travel_total_value: '',
    // Campos para hospedagem
    accommodation_reimbursement: ''
  });

  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { fetchMissions, insertExpense } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadMissions();
  }, []);

  // Calcular automaticamente o valor total da viagem
  useEffect(() => {
    if (formData.travel_km && formData.travel_km_rate) {
      const km = parseFloat(formData.travel_km);
      const rate = parseFloat(formData.travel_km_rate);
      const total = km * rate;
      setFormData(prev => ({
        ...prev,
        travel_total_value: total.toFixed(2),
        amount: total.toFixed(2) // Define o valor principal como o valor da viagem
      }));
    }
  }, [formData.travel_km, formData.travel_km_rate]);

  const loadMissions = async () => {
    try {
      const data = await fetchMissions();
      setMissions(data);
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        mission_id: formData.mission_id || null,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        is_advanced: formData.is_advanced,
        receipt: formData.receipt || null,
        // Campos específicos para deslocamento
        travel_km: formData.travel_km ? parseFloat(formData.travel_km) : null,
        travel_km_rate: formData.travel_km_rate ? parseFloat(formData.travel_km_rate) : null,
        travel_total_value: formData.travel_total_value ? parseFloat(formData.travel_total_value) : null,
        // Detalhes de hospedagem com reembolso opcional
        accommodation_details: formData.category === 'accommodation' && formData.accommodation_reimbursement 
          ? { reimbursement: parseFloat(formData.accommodation_reimbursement) }
          : null
      };

      console.log('Enviando despesa:', expenseData);

      const { data, error } = await insertExpense(expenseData);
      
      if (error) {
        console.error('Erro ao inserir despesa:', error);
        showError('Erro', `Erro ao salvar despesa: ${error}`);
        return;
      }

      console.log('Despesa salva com sucesso:', data);
      showSuccess('Sucesso', 'Despesa registrada com sucesso!');
      
      // Reset form
      setFormData({
        mission_id: '',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        is_advanced: false,
        receipt: '',
        travel_km: '',
        travel_km_rate: '',
        travel_total_value: '',
        accommodation_reimbursement: ''
      });

      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      showError('Erro', 'Erro inesperado ao salvar despesa');
    } finally {
      setLoading(false);
    }
  };

  const isDisplacementCategory = formData.category === 'fuel';
  const isAccommodationCategory = formData.category === 'accommodation';

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mission">Missão</Label>
            <Select 
              value={formData.mission_id} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, mission_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma missão (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma missão</SelectItem>
                {missions.map(mission => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title} - {mission.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, category: value, amount: '', travel_km: '', travel_km_rate: '', travel_total_value: '', accommodation_reimbursement: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel">Deslocamento</SelectItem>
                <SelectItem value="accommodation">Hospedagem</SelectItem>
                <SelectItem value="meals">Alimentação</SelectItem>
                <SelectItem value="materials">Materiais</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos específicos para deslocamento */}
          {isDisplacementCategory && (
            <>
              <div>
                <Label htmlFor="travel_km">Distância (KM) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.travel_km}
                  onChange={(e) => setFormData(prev => ({ ...prev, travel_km: e.target.value }))}
                  placeholder="Ex: 150.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="travel_km_rate">Valor por KM (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.travel_km_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, travel_km_rate: e.target.value }))}
                  placeholder="Ex: 0.65"
                  required
                />
              </div>

              <div>
                <Label htmlFor="travel_total_value">Valor Total da Viagem</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.travel_total_value}
                  readOnly
                  className="bg-gray-100"
                  placeholder="Calculado automaticamente"
                />
              </div>
            </>
          )}

          {/* Campo de valor geral (para outras categorias) */}
          {!isDisplacementCategory && (
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
          )}

          {/* Campo específico para reembolso de hospedagem */}
          {isAccommodationCategory && (
            <div>
              <Label htmlFor="accommodation_reimbursement">Reembolso (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.accommodation_reimbursement}
                onChange={(e) => setFormData(prev => ({ ...prev, accommodation_reimbursement: e.target.value }))}
                placeholder="Valor quando nota < valor gasto"
              />
            </div>
          )}

          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva a despesa..."
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_advanced"
            checked={formData.is_advanced}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, is_advanced: checked as boolean }))
            }
          />
          <Label htmlFor="is_advanced">Adiantamento</Label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Despesa'}
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
