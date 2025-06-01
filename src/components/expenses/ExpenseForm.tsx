
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

interface ExpenseFormProps {
  onExpenseSubmitted?: () => void;
}

export const ExpenseForm = ({ onExpenseSubmitted }: ExpenseFormProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastFeedback();
  const { addExpense } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    missionId: '',
    category: 'fuel' as const,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null as File | null,
    isAdvanced: false
  });

  const categories = [
    { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800' },
    { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800' },
    { value: 'meals', label: 'Alimentação', color: 'bg-green-100 text-green-800' },
    { value: 'transportation', label: 'Transporte', color: 'bg-purple-100 text-purple-800' },
    { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800' }
  ];

  const mockMissions = [
    { id: '1', title: 'Instalação - Cliente ABC' },
    { id: '2', title: 'Manutenção - Cliente XYZ' },
    { id: '3', title: 'Instalação - Cliente DEF' }
  ];

  const resetForm = () => {
    setFormData({
      missionId: '',
      category: 'fuel',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      receipt: null,
      isAdvanced: false
    });
  };

  const handleCancel = () => {
    resetForm();
    showSuccess('Cancelado', 'Formulário limpo com sucesso');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showError('Arquivo muito grande', 'O arquivo deve ter no máximo 10MB');
        return;
      }
      setFormData({...formData, receipt: file});
      showSuccess('Arquivo anexado', `${file.name} foi anexado com sucesso`);
    }
  };

  const removeFile = () => {
    setFormData({...formData, receipt: null});
    showSuccess('Arquivo removido', 'Comprovante removido com sucesso');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || !formData.missionId) {
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
      // Integrar com o sistema financeiro
      const expenseData = {
        missionId: formData.missionId,
        employeeId: user?.id || '1',
        employeeName: user?.name || 'Usuário',
        category: formData.category,
        description: formData.description,
        amount: amount,
        date: formData.date,
        isAdvanced: formData.isAdvanced,
        status: 'pending' as const
      };
      
      // Adicionar despesa ao contexto financeiro
      addExpense(expenseData);
      
      const impactMessage = formData.isAdvanced 
        ? 'Despesa registrada como adiantamento e já impactou o saldo da empresa.'
        : 'Despesa registrada e aguarda aprovação para reembolso.';
      
      showSuccess(
        'Despesa Registrada', 
        `${impactMessage} Valor: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      );
      
      resetForm();
      onExpenseSubmitted?.();
    } catch (error) {
      showError('Erro', 'Erro ao registrar despesa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">
        Registrar Nova Despesa de Viagem
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="missionId">Missão *</Label>
          <select
            id="missionId"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData.missionId}
            onChange={(e) => setFormData({...formData, missionId: e.target.value})}
            required
          >
            <option value="">Selecione uma missão</option>
            {mockMissions.map(mission => (
              <option key={mission.id} value={mission.id}>
                {mission.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Categoria *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(category => (
              <Badge
                key={category.value}
                className={`cursor-pointer ${
                  formData.category === category.value 
                    ? 'bg-blue-600 text-white' 
                    : category.color
                }`}
                onClick={() => setFormData({...formData, category: category.value as any})}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            placeholder="Descreva a despesa..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Valor (R$) *</Label>
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

          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAdvanced"
            checked={formData.isAdvanced}
            onCheckedChange={(checked) => setFormData({...formData, isAdvanced: checked as boolean})}
          />
          <Label htmlFor="isAdvanced" className="text-sm">
            Esta é uma despesa adiantada pela empresa
          </Label>
        </div>

        <div>
          <Label>Comprovante (Opcional)</Label>
          <div className="mt-2">
            {!formData.receipt ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para enviar</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG ou PDF (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{formData.receipt.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrar Despesa'}
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
