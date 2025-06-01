
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
    category: 'fuel',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null as File | null,
    isAdvanced: false,
    reimbursementAmount: '', // Valor da nota de ressarcimento
    thirdPartyCompany: '' // Empresa que fará o ressarcimento
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
      tooltip: 'Despesas com hotéis, pousadas ou outros tipos de acomodação durante viagens de trabalho. Para adiantamentos, registre tanto o valor gasto quanto o valor da nota de ressarcimento.'
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
      reimbursementAmount: '',
      thirdPartyCompany: ''
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
      const expenseData = {
        missionId: formData.missionId,
        employeeId: user?.id || '1',
        employeeName: user?.name || 'Usuário',
        category: formData.category,
        description: formData.description,
        amount: amount,
        date: formData.date,
        isAdvanced: formData.isAdvanced,
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
        reimbursementAmount: formData.reimbursementAmount ? parseFloat(formData.reimbursementAmount) : undefined,
        thirdPartyCompany: formData.thirdPartyCompany || undefined
      };
      
      addExpense(expenseData);
      
      let impactMessage = 'Despesa registrada e aguarda aprovação para reembolso.';
      
      if (formData.isAdvanced) {
        if (formData.category === 'accommodation' && formData.reimbursementAmount) {
          const reimbursementAmount = parseFloat(formData.reimbursementAmount);
          const netAmount = reimbursementAmount - amount;
          impactMessage = `Adiantamento registrado. Empresa pagou R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e receberá R$ ${reimbursementAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Resultado líquido: ${netAmount >= 0 ? '+' : ''}R$ ${Math.abs(netAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
        } else {
          impactMessage = 'Adiantamento registrado e já impactou o saldo da empresa.';
        }
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

  const showReimbursementFields = formData.category === 'accommodation' && formData.isAdvanced;

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
                      onClick={() => setFormData({...formData, category: category.value})}
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
              <Label htmlFor="amount">Valor Gasto (R$) *</Label>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm">
                  Marque esta opção quando a empresa arca com o custo inicialmente e será ressarcida posteriormente por uma empresa terceirizada.
                </p>
              </TooltipContent>
            </Tooltip>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Valor que será recebido da empresa terceirizada
                  </p>
                </div>

                <div>
                  <Label htmlFor="thirdPartyCompany">Empresa Terceirizada *</Label>
                  <Input
                    id="thirdPartyCompany"
                    placeholder="Nome da empresa que fará o ressarcimento"
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
