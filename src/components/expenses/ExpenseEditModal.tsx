
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info } from 'lucide-react';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface Expense {
  id: string;
  mission: string;
  employee: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: string;
  reimbursementAmount?: number;
  thirdPartyCompany?: string;
}

interface ExpenseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (expense: Expense) => void;
}

export const ExpenseEditModal = ({ isOpen, onClose, expense, onSave }: ExpenseEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mission: '',
    employee: '',
    category: '',
    description: '',
    amount: '',
    date: '',
    isAdvanced: false,
    status: 'pending',
    reimbursementAmount: '',
    thirdPartyCompany: ''
  });

  // Inicializar dados do formulário quando a despesa for carregada
  useEffect(() => {
    console.log('ExpenseEditModal - expense changed:', expense);
    if (expense && isOpen) {
      console.log('Loading expense data into form:', {
        mission: expense.mission,
        employee: expense.employee,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        isAdvanced: expense.isAdvanced,
        status: expense.status
      });
      
      setFormData({
        mission: expense.mission || '',
        employee: expense.employee || '',
        category: expense.category || '',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        date: expense.date || '',
        isAdvanced: expense.isAdvanced || false,
        status: expense.status || 'pending',
        reimbursementAmount: expense.reimbursementAmount?.toString() || '',
        thirdPartyCompany: expense.thirdPartyCompany || ''
      });
    } else if (!isOpen) {
      // Resetar formulário quando modal fechar
      setFormData({
        mission: '',
        employee: '',
        category: '',
        description: '',
        amount: '',
        date: '',
        isAdvanced: false,
        status: 'pending',
        reimbursementAmount: '',
        thirdPartyCompany: ''
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mission || !formData.employee || !formData.category || !formData.description || !formData.amount || !formData.date) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    // Validação específica para hospedagem com adiantamento
    if (formData.category === 'accommodation' && formData.isAdvanced) {
      if (!formData.reimbursementAmount || !formData.thirdPartyCompany) {
        showError('Campos Obrigatórios', 'Para hospedagem em adiantamento, informe o valor de ressarcimento e a empresa terceirizada');
        return;
      }
      
      const reimbursementAmount = parseFloat(formData.reimbursementAmount);
      if (isNaN(reimbursementAmount) || reimbursementAmount <= 0) {
        showError('Valor Inválido', 'Por favor, insira um valor de ressarcimento válido');
        return;
      }
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!expense) {
        showError('Erro', 'Despesa não encontrada');
        return;
      }

      const updatedExpense: Expense = {
        ...expense,
        mission: formData.mission,
        employee: formData.employee,
        category: formData.category,
        description: formData.description,
        amount,
        date: formData.date,
        isAdvanced: formData.isAdvanced,
        status: formData.status,
        reimbursementAmount: formData.reimbursementAmount ? parseFloat(formData.reimbursementAmount) : undefined,
        thirdPartyCompany: formData.thirdPartyCompany || undefined
      };

      console.log('Saving updated expense:', updatedExpense);
      onSave(updatedExpense);
      showSuccess('Sucesso', 'Despesa atualizada com sucesso!');
      onClose();
    } catch (error) {
      showError('Erro', 'Erro ao atualizar despesa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!expense) return null;

  const mockMissions = [
    'Instalação - Cliente ABC',
    'Instalação - Cliente XYZ', 
    'Manutenção - Cliente DEF',
    'Manutenção - Cliente GHI',
    'Missão 1',
    'Missão 2'
  ];

  const mockEmployees = [
    'Carlos Santos',
    'João Oliveira',
    'Maria Silva',
    'Pedro Costa'
  ];

  const showReimbursementFields = formData.category === 'accommodation' && formData.isAdvanced;

  console.log('Rendering form with data:', formData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mission">Missão *</Label>
              <Select value={formData.mission} onValueChange={(value) => 
                setFormData({...formData, mission: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a missão" />
                </SelectTrigger>
                <SelectContent>
                  {mockMissions.map((mission) => (
                    <SelectItem key={mission} value={mission}>{mission}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="employee">Funcionário *</Label>
              <Select value={formData.employee} onValueChange={(value) => 
                setFormData({...formData, employee: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => 
                setFormData({...formData, category: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="accommodation">Hospedagem</SelectItem>
                  <SelectItem value="meals">Alimentação</SelectItem>
                  <SelectItem value="transportation">Transporte</SelectItem>
                  <SelectItem value="materials">Materiais</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor Gasto (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData({...formData, status: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="reimbursed">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
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
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isAdvanced"
              checked={formData.isAdvanced}
              onCheckedChange={(checked) => setFormData({...formData, isAdvanced: checked})}
            />
            <Label htmlFor="isAdvanced">É um adiantamento?</Label>
          </div>

          {showReimbursementFields && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h5 className="font-medium text-slate-700">Informações de Ressarcimento</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reimbursementAmount">Valor da Nota de Ressarcimento (R$) *</Label>
                  <Input
                    id="reimbursementAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.reimbursementAmount}
                    onChange={(e) => setFormData({...formData, reimbursementAmount: e.target.value})}
                    required={showReimbursementFields}
                  />
                </div>

                <div>
                  <Label htmlFor="thirdPartyCompany">Empresa Terceirizada *</Label>
                  <Input
                    id="thirdPartyCompany"
                    placeholder="Nome da empresa"
                    value={formData.thirdPartyCompany}
                    onChange={(e) => setFormData({...formData, thirdPartyCompany: e.target.value})}
                    required={showReimbursementFields}
                  />
                </div>
              </div>

              {formData.amount && formData.reimbursementAmount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Resumo da Operação:</p>
                  <p className="text-sm text-blue-800">
                    Valor gasto: R$ {parseFloat(formData.amount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-blue-800">
                    Valor a receber: R$ {parseFloat(formData.reimbursementAmount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm font-medium text-blue-900">
                    Resultado líquido: {(() => {
                      const net = parseFloat(formData.reimbursementAmount || '0') - parseFloat(formData.amount || '0');
                      return `${net >= 0 ? '+' : ''}R$ ${Math.abs(net).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
