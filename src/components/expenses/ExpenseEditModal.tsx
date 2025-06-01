
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, X } from 'lucide-react';

interface ExpenseListItem {
  id: string;
  mission: {
    title?: string;
    location?: string;
    client_name?: string;
  } | string;
  employee: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: string;
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
  };
  employee_role?: string;
}

interface ExpenseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseListItem | null;
  onSave: (updatedExpense: ExpenseListItem) => void;
}

export const ExpenseEditModal = ({
  isOpen,
  onClose,
  expense,
  onSave
}: ExpenseEditModalProps) => {
  const [formData, setFormData] = useState<ExpenseListItem | null>(null);

  useEffect(() => {
    if (expense) {
      setFormData({ ...expense });
    }
  }, [expense]);

  if (!expense || !formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      transportation: 'Transporte',
      materials: 'Materiais',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || 'Outros';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      reimbursed: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || 'Pendente';
  };

  const mission = typeof expense.mission === 'object' ? expense.mission : { title: expense.mission };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Missão (Read-only) */}
          <div>
            <Label>Missão</Label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium">{mission.title || 'N/A'}</div>
              {mission.client_name && (
                <div className="text-sm text-gray-600">Cliente: {mission.client_name}</div>
              )}
              {mission.location && (
                <div className="text-sm text-gray-500">{mission.location}</div>
              )}
            </div>
          </div>

          {/* Funcionário (Read-only) */}
          <div>
            <Label>Funcionário</Label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium">{expense.employee}</div>
              <div className="text-sm text-gray-600">{expense.employee_role}</div>
            </div>
          </div>

          {/* Categoria (Read-only) */}
          <div>
            <Label>Categoria</Label>
            <Badge className="mt-1">
              {getCategoryLabel(expense.category)}
            </Badge>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Valor */}
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
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

          {/* Detalhes de Hospedagem (se existir) */}
          {formData.accommodationDetails && (
            <div>
              <Label>Detalhes de Hospedagem</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Label htmlFor="actualCost" className="text-xs">Gasto Real</Label>
                  <Input
                    id="actualCost"
                    type="number"
                    step="0.01"
                    value={formData.accommodationDetails.actualCost}
                    onChange={(e) => {
                      const actualCost = parseFloat(e.target.value) || 0;
                      const reimbursementAmount = formData.accommodationDetails?.reimbursementAmount || 0;
                      setFormData({
                        ...formData,
                        accommodationDetails: {
                          ...formData.accommodationDetails!,
                          actualCost,
                          netAmount: reimbursementAmount - actualCost
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="reimbursementAmount" className="text-xs">Ressarcimento</Label>
                  <Input
                    id="reimbursementAmount"
                    type="number"
                    step="0.01"
                    value={formData.accommodationDetails.reimbursementAmount}
                    onChange={(e) => {
                      const reimbursementAmount = parseFloat(e.target.value) || 0;
                      const actualCost = formData.accommodationDetails?.actualCost || 0;
                      setFormData({
                        ...formData,
                        accommodationDetails: {
                          ...formData.accommodationDetails!,
                          reimbursementAmount,
                          netAmount: reimbursementAmount - actualCost
                        }
                      });
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Líquido</Label>
                  <div className={`p-2 text-sm font-medium rounded ${formData.accommodationDetails.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.accommodationDetails.netAmount >= 0 ? '+' : ''}R$ {formData.accommodationDetails.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
