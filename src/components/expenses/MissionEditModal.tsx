
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { X } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  client: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: string;
  assignedEmployees: string[];
  totalExpenses: number;
  description?: string;
  progress?: number;
}

interface MissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
  onSave: (mission: Mission) => void;
}

export const MissionEditModal = ({ isOpen, onClose, mission, onSave }: MissionEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'planned',
    assignedEmployees: [] as string[],
    description: '',
    progress: 0
  });

  const mockEmployees = [
    { id: '1', name: 'Ana Silva (Proprietária)' },
    { id: '2', name: 'Carlos Santos' },
    { id: '3', name: 'João Oliveira' },
    { id: '4', name: 'Maria Costa' },
    { id: '5', name: 'Pedro Alves' }
  ];

  // Função segura para garantir que assignedEmployees seja um array
  const safeGetEmployees = (employees: string[] | undefined | null): string[] => {
    return Array.isArray(employees) ? employees : [];
  };

  useEffect(() => {
    if (mission) {
      setFormData({
        title: mission.title,
        client: mission.client,
        location: mission.location,
        startDate: mission.startDate,
        endDate: mission.endDate || '',
        status: mission.status,
        assignedEmployees: safeGetEmployees(mission.assignedEmployees),
        description: mission.description || '',
        progress: mission.progress || 0
      });
    }
  }, [mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.client.trim() || !formData.location.trim() || !formData.startDate) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.assignedEmployees.length === 0) {
      showError('Erro de Validação', 'Por favor, selecione pelo menos um funcionário');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedMission = {
        ...mission!,
        ...formData
      };

      onSave(updatedMission);
      showSuccess('Sucesso', 'Missão atualizada com sucesso!');
      onClose();
    } catch (error) {
      showError('Erro', 'Erro ao atualizar missão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeToggle = (employeeName: string) => {
    const currentEmployees = safeGetEmployees(formData.assignedEmployees);
    
    setFormData(prev => ({
      ...prev,
      assignedEmployees: currentEmployees.includes(employeeName)
        ? currentEmployees.filter(emp => emp !== employeeName)
        : [...currentEmployees, employeeName]
    }));
  };

  const removeEmployee = (employeeName: string) => {
    const currentEmployees = safeGetEmployees(formData.assignedEmployees);
    
    setFormData(prev => ({
      ...prev,
      assignedEmployees: currentEmployees.filter(emp => emp !== employeeName)
    }));
  };

  if (!mission) return null;

  const currentAssignedEmployees = safeGetEmployees(formData.assignedEmployees);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Missão</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título da Missão *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Local *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData({...formData, status: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planejada</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.status === 'in-progress' && (
              <div>
                <Label htmlFor="progress">Progresso (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Funcionários Designados *</Label>
            <div className="space-y-2 mt-2">
              {mockEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={employee.id}
                    checked={currentAssignedEmployees.includes(employee.name)}
                    onCheckedChange={() => handleEmployeeToggle(employee.name)}
                  />
                  <Label htmlFor={employee.id} className="text-sm">
                    {employee.name}
                  </Label>
                </div>
              ))}
            </div>
            {currentAssignedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {currentAssignedEmployees.map((employee, index) => (
                  <Badge key={index} variant="outline" className="px-2 py-1">
                    {employee}
                    <button
                      type="button"
                      onClick={() => removeEmployee(employee)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição detalhada da missão..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
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
