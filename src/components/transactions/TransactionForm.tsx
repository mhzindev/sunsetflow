
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, X, HelpCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { TransactionCategory, PaymentMethod } from '@/types/transaction';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancial } from '@/contexts/FinancialContext';

interface TransactionFormProps {
  onTransactionSubmitted?: () => void;
}

export const TransactionForm = ({ onTransactionSubmitted }: TransactionFormProps) => {
  const { user } = useAuth();
  const { addTransaction, addReceivable } = useFinancial();
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'fuel' as TransactionCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    method: 'pix' as PaymentMethod,
    receipt: null as File | null,
    // Campos específicos para recebimentos de clientes
    clientPaymentStatus: 'completed' as 'completed' | 'pending',
    clientName: '',
    expectedPaymentDate: '',
    notes: ''
  });

  const categories = user?.role === 'employee' 
    ? [
        { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800', tooltip: 'Gastos com combustível para veículos da empresa durante viagens ou operações' },
        { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800', tooltip: 'Despesas com hotéis, pousadas ou acomodações durante viagens de trabalho' },
        { value: 'meals', label: 'Alimentação', color: 'bg-green-100 text-green-800', tooltip: 'Gastos com refeições durante expediente ou viagens de trabalho' },
        { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800', tooltip: 'Compra de materiais e ferramentas necessários para execução dos serviços' },
        { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800', tooltip: 'Outras despesas relacionadas ao trabalho não contempladas nas categorias anteriores' }
      ]
    : [
        { value: 'service_payment', label: 'Pagamento Serviços', color: 'bg-red-100 text-red-800', tooltip: 'Pagamentos realizados a prestadores de serviços externos, freelancers e fornecedores' },
        { value: 'client_payment', label: 'Recebimento Cliente', color: 'bg-green-100 text-green-800', tooltip: 'Valores recebidos de clientes pelos serviços prestados. Permite controlar se já foi pago ou está pendente' },
        { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800', tooltip: 'Gastos com combustível para veículos da empresa' },
        { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800', tooltip: 'Despesas com hotéis e acomodações para funcionários' },
        { value: 'meals', label: 'Alimentação', color: 'bg-emerald-100 text-emerald-800', tooltip: 'Gastos com alimentação da equipe' },
        { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800', tooltip: 'Compra de materiais para operação e manutenção' },
        { value: 'maintenance', label: 'Manutenção', color: 'bg-purple-100 text-purple-800', tooltip: 'Gastos com manutenção de equipamentos, veículos e infraestrutura' },
        { value: 'office_expense', label: 'Despesa Escritório', color: 'bg-indigo-100 text-indigo-800', tooltip: 'Despesas administrativas e operacionais do escritório' },
        { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800', tooltip: 'Outras transações não contempladas nas categorias específicas' }
      ];

  const paymentMethods = [
    { value: 'pix', label: 'PIX' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'cash', label: 'Dinheiro' }
  ];

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: 'fuel',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      method: 'pix',
      receipt: null,
      clientPaymentStatus: 'completed',
      clientName: '',
      expectedPaymentDate: '',
      notes: ''
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
    
    if (!formData.description.trim() || !formData.amount) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validação específica para recebimento de cliente
    if (formData.category === 'client_payment' && formData.type === 'income') {
      if (!formData.clientName.trim()) {
        showError('Erro de Validação', 'Por favor, informe o nome do cliente');
        return;
      }
      if (formData.clientPaymentStatus === 'pending' && !formData.expectedPaymentDate) {
        showError('Erro de Validação', 'Por favor, informe a data prevista para o pagamento');
        return;
      }
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Para recebimentos de clientes, criar transação e recebível se necessário
      if (formData.category === 'client_payment' && formData.type === 'income') {
        if (formData.clientPaymentStatus === 'pending') {
          // Criar recebível pendente
          const receivableData = {
            clientName: formData.clientName,
            amount: amount,
            description: formData.description,
            expectedDate: formData.expectedPaymentDate,
            notes: formData.notes,
            createdDate: formData.date,
            userId: user?.id || '',
            userName: user?.name || 'Usuário',
            status: 'pending' as const
          };
          addReceivable(receivableData);
          
          showSuccess(
            'Recebível Registrado', 
            `Recebimento de ${formData.clientName} no valor de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado como pendente!`
          );
        } else {
          // Criar transação de entrada imediatamente
          const transactionData = {
            type: formData.type,
            category: formData.category,
            amount: amount,
            description: `${formData.description} - Cliente: ${formData.clientName}`,
            date: formData.date,
            method: formData.method,
            status: 'completed' as const,
            userId: user?.id || '',
            userName: user?.name || 'Usuário',
            receipt: formData.receipt?.name,
            clientName: formData.clientName,
            // Add required fields
            isRecurring: false,
            tags: ['client_payment'],
            createdAt: new Date().toISOString()
          };
          
          addTransaction(transactionData);
          
          showSuccess(
            'Recebimento Registrado', 
            `Recebimento de ${formData.clientName} no valor de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado com sucesso!`
          );
        }
      } else {
        // Transação normal
        const transactionData = {
          type: formData.type,
          category: formData.category,
          amount: amount,
          description: formData.description,
          date: formData.date,
          method: formData.method,
          status: 'completed' as const,
          userId: user?.id || '',
          userName: user?.name || 'Usuário',
          receipt: formData.receipt?.name,
          // Add required fields
          isRecurring: false,
          tags: [formData.category],
          createdAt: new Date().toISOString()
        };
        
        addTransaction(transactionData);
        
        const typeText = formData.type === 'income' ? 'Entrada' : 'Saída';
        showSuccess(
          'Transação Registrada', 
          `${typeText} de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrada com sucesso!`
        );
      }
      
      resetForm();
      onTransactionSubmitted?.();
    } catch (error) {
      showError('Erro', 'Erro ao registrar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const isClientPayment = formData.category === 'client_payment' && formData.type === 'income';

  return (
    <TooltipProvider>
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">
          {user?.role === 'employee' ? 'Registrar Despesa de Viagem' : 'Nova Transação'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === 'owner' && (
            <div>
              <Label>Tipo de Transação</Label>
              <div className="flex space-x-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
                  />
                  <span>Entrada</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
                  />
                  <span>Saída</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <Label>Categoria</Label>
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
                      onClick={() => setFormData({...formData, category: category.value as TransactionCategory})}
                    >
                      {category.label}
                      <HelpCircle className="w-3 h-3 ml-1" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{category.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Campos específicos para recebimento de cliente */}
          {isClientPayment && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-800 mb-3">Detalhes do Cliente</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    placeholder="Nome do cliente..."
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>Status do Pagamento</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientPaymentStatus"
                        value="completed"
                        checked={formData.clientPaymentStatus === 'completed'}
                        onChange={(e) => setFormData({...formData, clientPaymentStatus: e.target.value as 'completed' | 'pending'})}
                      />
                      <span className="text-green-700">Já Pago</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="clientPaymentStatus"
                        value="pending"
                        checked={formData.clientPaymentStatus === 'pending'}
                        onChange={(e) => setFormData({...formData, clientPaymentStatus: e.target.value as 'completed' | 'pending'})}
                      />
                      <span className="text-orange-700">A Receber</span>
                    </label>
                  </div>
                </div>
              </div>

              {formData.clientPaymentStatus === 'pending' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedPaymentDate">Data Prevista do Pagamento</Label>
                    <Input
                      id="expectedPaymentDate"
                      type="date"
                      value={formData.expectedPaymentDate}
                      onChange={(e) => setFormData({...formData, expectedPaymentDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      placeholder="Observações adicionais..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
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
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="method">Forma de Pagamento</Label>
              <select
                id="method"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value as PaymentMethod})}
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
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
              {isLoading ? 'Registrando...' : 
               isClientPayment && formData.clientPaymentStatus === 'pending' ? 'Registrar Recebível' : 
               'Registrar Transação'}
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
