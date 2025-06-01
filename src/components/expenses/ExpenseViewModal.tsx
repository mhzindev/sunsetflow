
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Calendar, DollarSign, FileText, Edit, Receipt, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

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

interface ExpenseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit?: (expense: Expense) => void;
  onApprove?: (expense: Expense) => void;
}

export const ExpenseViewModal = ({ isOpen, onClose, expense, onEdit, onApprove }: ExpenseViewModalProps) => {
  const { showSuccess } = useToastFeedback();
  const { processExpenseApproval, processExpenseReimbursement } = useFinancial();

  if (!expense) return null;

  const getCategoryColor = (category: string) => {
    const colors = {
      fuel: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-blue-100 text-blue-800',
      meals: 'bg-green-100 text-green-800',
      transportation: 'bg-purple-100 text-purple-800',
      materials: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      reimbursed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
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

  const handleEditClick = () => {
    onEdit?.(expense);
    onClose();
  };

  const handleApprove = () => {
    // Integrar com o sistema financeiro
    processExpenseApproval(expense.id, expense.amount, expense.description);
    onApprove?.(expense);
    
    showSuccess(
      'Despesa Aprovada', 
      `Despesa de R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de ${expense.employee} foi aprovada e registrada no sistema!`
    );
    onClose();
  };

  const handleReimburse = () => {
    // Integrar com o sistema financeiro para criar transação de reembolso
    processExpenseReimbursement(expense.id, expense.amount, expense.description, expense.employee);
    
    showSuccess(
      'Reembolso Processado', 
      `Reembolso de R$ ${expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para ${expense.employee} foi processado e registrado no sistema financeiro!`
    );
    onClose();
  };

  const handleGenerateReceipt = () => {
    showSuccess('Comprovante Gerado', `Comprovante da despesa de ${expense.employee} está sendo preparado para download`);
  };

  const isHighValue = expense.amount > 500;
  const isPending = expense.status === 'pending';
  const isApproved = expense.status === 'approved';
  const isOld = new Date().getTime() - new Date(expense.date).getTime() > 30 * 24 * 60 * 60 * 1000; // 30 dias

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Detalhes da Despesa</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alertas de Contexto */}
          {isHighValue && isPending && (
            <Card className="p-4 border-orange-200 bg-orange-50">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-800">Despesa de Alto Valor</p>
                  <p className="text-sm text-orange-600">
                    Esta despesa de R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} requer aprovação gerencial
                  </p>
                </div>
              </div>
            </Card>
          )}

          {isOld && isPending && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Despesa Antiga Pendente</p>
                  <p className="text-sm text-red-600">
                    Esta despesa está pendente há mais de 30 dias e precisa de atenção
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Informações Principais */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{expense.description}</h3>
                <p className="text-slate-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {expense.mission}
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge className={getStatusColor(expense.status)}>
                  {getStatusLabel(expense.status)}
                </Badge>
                <Badge variant={expense.isAdvanced ? 'default' : 'secondary'}>
                  {expense.isAdvanced ? 'Adiantamento' : 'Reembolso'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-sm text-slate-500">Funcionário:</span>
                  <span className="ml-2 font-medium">{expense.employee}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-sm text-slate-500">Data:</span>
                  <span className="ml-2 font-medium">
                    {new Date(expense.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="text-sm text-slate-500">Valor:</span>
                  <span className="ml-2 font-semibold text-lg text-green-600">
                    R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <Badge className={getCategoryColor(expense.category)} variant="outline">
                    {getCategoryLabel(expense.category)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Contexto da Missão */}
          <Card className="p-4">
            <h4 className="font-semibold text-slate-800 mb-3">Contexto da Missão</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-slate-700 mb-2">
                <strong>Tipo de Serviço:</strong> {expense.mission.includes('Instalação') ? 'Instalação de Rastreadores' : 'Manutenção de Equipamentos'}
              </p>
              <p className="text-slate-700">
                <strong>Localização:</strong> {expense.mission}
              </p>
            </div>
          </Card>

          {/* Análise de Custo-Benefício */}
          {expense.category === 'fuel' && (
            <Card className="p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Análise de Eficiência</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Custo por KM (estimado)</p>
                  <p className="text-lg font-semibold text-blue-800">
                    R$ {(expense.amount / 300).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Eficiência</p>
                  <p className="text-lg font-semibold text-green-800">
                    {expense.amount < 200 ? 'Excelente' : expense.amount < 400 ? 'Boa' : 'Verificar'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Separator />

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            {expense.status === 'pending' && (
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar Despesa
              </Button>
            )}
            {isApproved && (
              <Button onClick={handleReimburse} className="bg-blue-600 hover:bg-blue-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Processar Reembolso
              </Button>
            )}
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleGenerateReceipt}>
              <Receipt className="w-4 h-4 mr-2" />
              Gerar Comprovante
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
