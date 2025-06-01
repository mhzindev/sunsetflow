
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, CheckCircle } from 'lucide-react';

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

interface ExpenseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseListItem | null;
  onEdit: (expense: ExpenseListItem) => void;
  onApprove: (expense: ExpenseListItem) => void;
}

export const ExpenseViewModal = ({
  isOpen,
  onClose,
  expense,
  onEdit,
  onApprove
}: ExpenseViewModalProps) => {
  if (!expense) return null;

  const mission = typeof expense.mission === 'object' ? expense.mission : { title: expense.mission };

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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      reimbursed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Despesa</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Missão */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Missão</h3>
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

          {/* Informações do Funcionário */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Funcionário</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="font-medium">{expense.employee}</div>
              <div className="text-sm text-gray-600">{expense.employee_role}</div>
            </div>
          </div>

          <Separator />

          {/* Detalhes da Despesa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Categoria</label>
              <Badge className="mt-1 block w-fit">
                {getCategoryLabel(expense.category)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <Badge className={`mt-1 block w-fit ${getStatusColor(expense.status)}`}>
                {getStatusLabel(expense.status)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Valor</label>
              <div className="font-semibold text-lg">
                R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data</label>
              <div>{new Date(expense.date).toLocaleDateString('pt-BR')}</div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600">Tipo</label>
              <Badge variant={expense.isAdvanced ? 'default' : 'secondary'} className="mt-1">
                {expense.category === 'accommodation' ? 'Hospedagem' : (expense.isAdvanced ? 'Adiantamento' : 'Reembolso')}
              </Badge>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-gray-600">Descrição</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
              {expense.description}
            </div>
          </div>

          {/* Detalhes de Hospedagem */}
          {expense.accommodationDetails && (
            <div>
              <label className="text-sm font-medium text-gray-600">Detalhes de Hospedagem</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Gasto:</span>
                  <span>R$ {expense.accommodationDetails.actualCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ressarcimento:</span>
                  <span>R$ {expense.accommodationDetails.reimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <Separator />
                <div className={`flex justify-between font-semibold ${expense.accommodationDetails.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Líquido:</span>
                  <span>
                    {expense.accommodationDetails.netAmount >= 0 ? '+' : ''}R$ {expense.accommodationDetails.netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onEdit(expense)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {expense.status === 'pending' && (
              <Button onClick={() => onApprove(expense)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
