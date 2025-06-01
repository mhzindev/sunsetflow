import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, X, Info } from 'lucide-react';
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
    isAdvanced: false,
    // Campos específicos para hospedagem
    accommodationActualCost: '',
    accommodationReimbursement: '',
    outsourcingCompany: '',
    invoiceNumber: ''
  });

  const categories = [
    { 
      value: 'fuel', 
      label: 'Combustível', 
      color: 'bg-orange-100 text-orange-800',
      tooltip: 'Gastos com combustível para veículos da empresa durante viagens de trabalho. Inclui gasolina, etanol, diesel e outros combustíveis necessários para deslocamentos.'
    },
    { 
      value: 'accommodation', 
      label: 'Hospedagem', 
      color: 'bg-blue-100 text-blue-800',
      tooltip: 'Despesas com hotéis, pousadas ou outros tipos de acomodação durante viagens de trabalho. A empresa arca inicialmente com o custo e depois é ressarcida pela empresa terceirizada.'
    },
    { 
      value: 'meals', 
      label: 'Alimentação', 
      color: 'bg-green-100 text-green-800',
      tooltip: 'Gastos com refeições durante viagens de trabalho, incluindo café da manhã, almoço, jantar e lanches necessários durante o período de trabalho fora da sede.'
    },
    { 
      value: 'transportation', 
      label: 'Transporte', 
      color: 'bg-purple-100 text-purple-800',
      tooltip: 'Despesas com transporte público, táxi, Uber, pedágios, estacionamento e outros meios de locomoção necessários para execução do trabalho.'
    },
    { 
      value: 'materials', 
      label: 'Materiais', 
      color: 'bg-yellow-100 text-yellow-800',
      tooltip: 'Compra de materiais, ferramentas ou equipamentos necessários para execução dos serviços em campo. Inclui peças de reposição e consumíveis.'
    },
    { 
      value: 'other', 
      label: 'Outros', 
      color: 'bg-gray-100 text-gray-800',
      tooltip: 'Outras despesas relacionadas ao trabalho que não se enquadram nas categorias anteriores. Detalhe sempre na descrição o tipo de gasto realizado.'
    }
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
      isAdvanced: false,
      accommodationActualCost: '',
      accommodationReimbursement: '',
      outsourcingCompany: '',
      invoiceNumber: ''
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
    
    if (!formData.description.trim() || !formData.missionId) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validação específica para hospedagem
    if (formData.category === 'accommodation') {
      if (!formData.accommodationActualCost || !formData.accommodationReimbursement) {
        showError('Erro de Validação', 'Para hospedagem, informe o valor gasto e o valor de ressarcimento');
        return;
      }

      const actualCost = parseFloat(formData.accommodationActualCost);
      const reimbursement = parseFloat(formData.accommodationReimbursement);

      if (isNaN(actualCost) || actualCost <= 0 || isNaN(reimbursement) || reimbursement <= 0) {
        showError('Valor Inválido', 'Por favor, insira valores válidos maiores que zero');
        return;
      }
    } else {
      if (!formData.amount) {
        showError('Erro de Validação', 'Por favor, informe o valor da despesa');
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      let expenseData;

      if (formData.category === 'accommodation') {
        const actualCost = parseFloat(formData.accommodationActualCost);
        const reimbursementAmount = parseFloat(formData.accommodationReimbursement);
        const netAmount = reimbursementAmount - actualCost;

        expenseData = {
          missionId: formData.missionId,
          employeeId: user?.id || '1',
          employeeName: user?.name || 'Usuário',
          category: formData.category,
          description: formData.description,
          amount: actualCost, // O valor base da despesa é o custo real
          date: formData.date,
          isAdvanced: true, // Hospedagem sempre é adiantamento pela empresa
          status: 'pending' as const,
          submittedAt: new Date().toISOString(),
          accommodationDetails: {
            actualCost,
            reimbursementAmount,
            netAmount,
            outsourcingCompany: formData.outsourcingCompany,
            invoiceNumber: formData.invoiceNumber
          }
        };
      } else {
        const amount = parseFloat(formData.amount);
        expenseData = {
          missionId: formData.missionId,
          employeeId: user?.id || '1',
          employeeName: user?.name || 'Usuário',
          category: formData.category,
          description: formData.description,
          amount: amount,
          date: formData.date,
          isAdvanced: formData.isAdvanced,
          status: 'pending' as const,
          submittedAt: new Date().toISOString()
        };
      }
      
      addExpense(expenseData);
      
      let impactMessage;
      if (formData.category === 'accommodation') {
        const netAmount = parseFloat(formData.accommodationReimbursement) - parseFloat(formData.accommodationActualCost);
        impactMessage = `Hospedagem registrada. Custo: R$ ${parseFloat(formData.accommodationActualCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, Ressarcimento: R$ ${parseFloat(formData.accommodationReimbursement).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Impacto líquido: ${netAmount >= 0 ? '+' : ''}R$ ${netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      } else if (formData.isAdvanced) {
        impactMessage = 'Despesa registrada como adiantamento e já impactou o saldo da empresa.';
      } else {
        impactMessage = 'Despesa registrada e aguarda aprovação para reembolso.';
      }
      
      showSuccess('Despesa Registrada', impactMessage);
      
      resetForm();
      onExpenseSubmitted?.();
    } catch (error) {
      showError('Erro', 'Erro ao registrar despesa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAccommodation = formData.category === 'accommodation';

  return (
    <TooltipProvider>
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
                <Tooltip key={category.value}>
                  <TooltipTrigger asChild>
                    <Badge
                      className={`cursor-pointer ${
                        formData.category === category.value 
                          ? 'bg-blue-600 text-white' 
                          : category.color
                      }`}
                      onClick={() => setFormData({...formData, category: category.value as any})}
                    >
                      {category.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{category.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {isAccommodation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-3">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                <h5 className="font-medium text-blue-800">Detalhes da Hospedagem</h5>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accommodationActualCost">Valor Gasto (R$) *</Label>
                  <Input
                    id="accommodationActualCost"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.accommodationActualCost}
                    onChange={(e) => setFormData({...formData, accommodationActualCost: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">Valor realmente gasto com hospedagem</p>
                </div>

                <div>
                  <Label htmlFor="accommodationReimbursement">Valor da Nota de Ressarcimento (R$) *</Label>
                  <Input
                    id="accommodationReimbursement"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.accommodationReimbursement}
                    onChange={(e) => setFormData({...formData, accommodationReimbursement: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">Valor da nota gerada pela empresa terceirizada</p>
                </div>

                <div>
                  <Label htmlFor="outsourcingCompany">Empresa Terceirizada</Label>
                  <Input
                    id="outsourcingCompany"
                    placeholder="Nome da empresa que terceirizou"
                    value={formData.outsourcingCompany}
                    onChange={(e) => setFormData({...formData, outsourcingCompany: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="invoiceNumber">Número da Nota Fiscal</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="Número da nota fiscal"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  />
                </div>
              </div>

              {formData.accommodationActualCost && formData.accommodationReimbursement && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <h6 className="font-medium text-gray-800 mb-2">Resumo Financeiro:</h6>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Custo Real:</span>
                      <span className="text-red-600">-R$ {parseFloat(formData.accommodationActualCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ressarcimento:</span>
                      <span className="text-green-600">+R$ {parseFloat(formData.accommodationReimbursement).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Impacto Líquido:</span>
                      {(() => {
                        const netAmount = parseFloat(formData.accommodationReimbursement) - parseFloat(formData.accommodationActualCost);
                        return (
                          <span className={netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {netAmount >= 0 ? '+' : ''}R$ {netAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {!isAccommodation && (
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
          )}

          {isAccommodation && (
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="w-full md:w-1/2"
              />
            </div>
          )}

          {!isAccommodation && (
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
          )}

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
    </TooltipProvider>
  );
};
