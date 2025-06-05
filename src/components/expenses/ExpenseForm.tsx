import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ReceiptUpload } from "@/components/common/ReceiptUpload";
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
    invoice_amount: '',
    date: new Date().toISOString().split('T')[0],
    is_advanced: false as boolean,
    receipt: '',
    travel_km: '',
    travel_km_rate: '',
    travel_total_value: '',
    accommodation_reimbursement: ''
  });

  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { fetchMissions, insertExpense, insertTransaction } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadMissions();
  }, []);

  // Calcular automaticamente o valor total da viagem (para deslocamento)
  useEffect(() => {
    if (formData.travel_km && formData.travel_km_rate) {
      const km = parseFloat(formData.travel_km);
      const rate = parseFloat(formData.travel_km_rate);
      const total = km * rate;
      setFormData(prev => ({
        ...prev,
        travel_total_value: total.toFixed(2)
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
    if (!formData.category || !formData.description) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      if (formData.category === 'displacement') {
        // LÓGICA PARA DESLOCAMENTO
        if (!formData.travel_km || !formData.travel_km_rate) {
          showError('Erro', 'Para deslocamento, informe a distância e valor por KM');
          return;
        }

        const km = parseFloat(formData.travel_km);
        const rate = parseFloat(formData.travel_km_rate);
        const totalRevenue = km * rate;

        // 1. Criar registro na tabela expenses com categoria "displacement"
        const expenseData = {
          mission_id: formData.mission_id === 'none' ? null : formData.mission_id || null,
          category: 'displacement', // Mudança aqui: usar "displacement" em vez de "fuel"
          description: formData.description,
          amount: totalRevenue, // Valor da receita
          date: formData.date,
          is_advanced: false,
          receipt: formData.receipt || null,
          travel_km: km,
          travel_km_rate: rate,
          travel_total_value: totalRevenue
        };

        console.log('Criando registro de despesa de deslocamento:', expenseData);
        
        const { data: expenseResult, error: expenseError } = await insertExpense(expenseData);
        
        if (expenseError) {
          console.error('Erro ao criar registro de despesa:', expenseError);
          showError('Erro', `Erro ao registrar despesa: ${expenseError}`);
          return;
        }

        // 2. Criar transação de receita com categoria "fuel" (para manter compatibilidade com o sistema de transações)
        const revenueData = {
          type: 'income' as const,
          category: 'fuel' as const, // Manter "fuel" para transações por compatibilidade
          description: `Receita de deslocamento: ${formData.description}`,
          amount: totalRevenue,
          date: formData.date,
          method: 'transfer' as const,
          mission_id: formData.mission_id === 'none' ? null : formData.mission_id || null,
          receipt: formData.receipt || null,
          status: 'completed' as const
        };

        console.log('Criando receita de deslocamento:', revenueData);
        
        const { data: revenueResult, error: revenueError } = await insertTransaction(revenueData);
        
        if (revenueError) {
          console.error('Erro ao criar receita de deslocamento:', revenueError);
          showError('Erro', `Erro ao registrar receita de deslocamento: ${revenueError}`);
          return;
        }

        console.log('Deslocamento registrado com sucesso:', { expenseResult, revenueResult });
        showSuccess('Sucesso', `Deslocamento registrado: R$ ${totalRevenue.toFixed(2)}`);

      } else if (formData.category === 'accommodation') {
        // LÓGICA PARA HOSPEDAGEM
        if (!formData.invoice_amount || !formData.amount) {
          showError('Erro', 'Para hospedagem, informe o valor da nota fiscal e o valor gasto pela empresa');
          return;
        }

        const invoiceAmount = parseFloat(formData.invoice_amount);
        const companyCost = parseFloat(formData.amount);
        const netRevenue = invoiceAmount - companyCost;

        // 1. Criar registro na tabela expenses
        const expenseData = {
          mission_id: formData.mission_id === 'none' ? null : formData.mission_id || null,
          category: formData.category,
          description: formData.description,
          amount: companyCost, // Valor gasto pela empresa
          invoice_amount: invoiceAmount,
          date: formData.date,
          is_advanced: false,
          receipt: formData.receipt || null,
          accommodation_details: {
            actualCost: companyCost,
            invoiceAmount: invoiceAmount,
            netAmount: netRevenue
          }
        };

        console.log('Criando registro de despesa de hospedagem:', expenseData);
        
        const { data: expenseResult, error: expenseError } = await insertExpense(expenseData);
        
        if (expenseError) {
          console.error('Erro ao criar registro de despesa:', expenseError);
          showError('Erro', `Erro ao registrar despesa: ${expenseError}`);
          return;
        }

        // 2. Se há receita líquida positiva, registrar transação de receita
        if (netRevenue > 0) {
          const revenueData = {
            type: 'income' as const,
            category: 'accommodation' as const,
            description: `Receita de hospedagem: ${formData.description}`,
            amount: netRevenue, // APENAS A RECEITA LÍQUIDA
            date: formData.date,
            method: 'transfer' as const,
            mission_id: formData.mission_id === 'none' ? null : formData.mission_id || null,
            receipt: formData.receipt || null,
            status: 'completed' as const
          };

          console.log('Criando receita de hospedagem:', revenueData);
          
          const { data: revenueResult, error: revenueError } = await insertTransaction(revenueData);
          
          if (revenueError) {
            console.error('Erro ao criar receita de hospedagem:', revenueError);
            showError('Erro', `Erro ao registrar receita de hospedagem: ${revenueError}`);
            return;
          }

          console.log('Hospedagem registrada com receita:', { expenseResult, revenueResult });
          showSuccess('Sucesso', `Hospedagem registrada - Gasto da Empresa: R$ ${companyCost.toFixed(2)}, Receita Líquida: R$ ${netRevenue.toFixed(2)}`);
        } else {
          console.log('Hospedagem registrada sem receita:', expenseResult);
          showSuccess('Sucesso', `Hospedagem registrada - Gasto da Empresa: R$ ${companyCost.toFixed(2)} (sem receita adicional)`);
        }

      } else {
        // Para outras categorias, registrar como despesa normal da empresa
        if (!formData.amount) {
          showError('Erro', 'Informe o valor da despesa');
          return;
        }

        const expenseData = {
          mission_id: formData.mission_id === 'none' ? null : formData.mission_id || null,
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          invoice_amount: formData.invoice_amount ? parseFloat(formData.invoice_amount) : null,
          date: formData.date,
          is_advanced: formData.is_advanced,
          receipt: formData.receipt || null
        };

        console.log('Enviando despesa da empresa:', expenseData);

        const { data, error } = await insertExpense(expenseData);
        
        if (error) {
          console.error('Erro ao inserir despesa:', error);
          showError('Erro', `Erro ao salvar despesa: ${error}`);
          return;
        }

        console.log('Despesa da empresa salva com sucesso:', data);
        showSuccess('Sucesso', 'Despesa da empresa registrada com sucesso!');
      }
      
      // Reset form
      setFormData({
        mission_id: '',
        category: '',
        description: '',
        amount: '',
        invoice_amount: '',
        date: new Date().toISOString().split('T')[0],
        is_advanced: false as boolean,
        receipt: '',
        travel_km: '',
        travel_km_rate: '',
        travel_total_value: '',
        accommodation_reimbursement: ''
      });

      onSave?.();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showError('Erro', 'Erro inesperado ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    const booleanValue = checked === true;
    setFormData(prev => ({ ...prev, is_advanced: booleanValue }));
  };

  const isDisplacementCategory = formData.category === 'displacement';
  const isAccommodationCategory = formData.category === 'accommodation';

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mission">Missão</Label>
            <Select 
              value={formData.mission_id || 'none'} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, mission_id: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma missão (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma missão</SelectItem>
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
                setFormData(prev => ({ 
                  ...prev, 
                  category: value, 
                  amount: '', 
                  invoice_amount: '',
                  travel_km: '', 
                  travel_km_rate: '', 
                  travel_total_value: '', 
                  accommodation_reimbursement: '' 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="displacement">Deslocamento</SelectItem>
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

              <div className="md:col-span-2">
                <Label htmlFor="travel_total_value">Valor Total da Receita</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.travel_total_value}
                  readOnly
                  className="bg-gray-100"
                  placeholder="Calculado automaticamente (KM × Valor/KM)"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Este será o valor registrado como receita da empresa
                </p>
              </div>
            </>
          )}

          {/* Campos específicos para hospedagem */}
          {isAccommodationCategory && (
            <>
              <div>
                <Label htmlFor="invoice_amount">Valor da Nota Fiscal *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.invoice_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoice_amount: e.target.value }))}
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Valor que será cobrado do cliente
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Valor Gasto pela Empresa *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Valor que a empresa realmente gastou
                </p>
              </div>
            </>
          )}

          {/* Campo de valor para outras categorias */}
          {!isDisplacementCategory && !isAccommodationCategory && (
            <div>
              <Label htmlFor="amount">Valor da Despesa *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Valor gasto pela empresa
              </p>
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
            placeholder={
              isDisplacementCategory 
                ? "Descreva o deslocamento..."
                : isAccommodationCategory 
                ? "Descreva a hospedagem..."
                : "Descreva a despesa da empresa..."
            }
            required
          />
        </div>

        <ReceiptUpload
          value={formData.receipt}
          onChange={(url) => setFormData(prev => ({ ...prev, receipt: url || '' }))}
          label="Comprovante"
        />

        {!isDisplacementCategory && !isAccommodationCategory && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_advanced"
              checked={formData.is_advanced}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_advanced">Adiantamento</Label>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : (
              isDisplacementCategory ? 'Registrar Deslocamento' : 
              isAccommodationCategory ? 'Registrar Hospedagem' : 
              'Salvar Despesa da Empresa'
            )}
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
