
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
    status: 'pending'
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
        status: expense.status || 'pending'
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
        status: 'pending'
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
        status: formData.status
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
              <Label htmlFor="amount">Valor (R$) *</Label>
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
