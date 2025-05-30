import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { TransactionCategory, PaymentMethod } from '@/types/transaction';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface TransactionFormProps {
  onTransactionSubmitted?: () => void;
}

export const TransactionForm = ({ onTransactionSubmitted }: TransactionFormProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'fuel' as TransactionCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    method: 'pix' as PaymentMethod,
    receipt: null as File | null
  });

  const categories = user?.role === 'employee' 
    ? [
        { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800' },
        { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800' },
        { value: 'meals', label: 'Alimentação', color: 'bg-green-100 text-green-800' },
        { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800' }
      ]
    : [
        { value: 'service_payment', label: 'Pagamento Serviços', color: 'bg-red-100 text-red-800' },
        { value: 'client_payment', label: 'Recebimento Cliente', color: 'bg-green-100 text-green-800' },
        { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800' },
        { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800' },
        { value: 'meals', label: 'Alimentação', color: 'bg-emerald-100 text-emerald-800' },
        { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'maintenance', label: 'Manutenção', color: 'bg-purple-100 text-purple-800' },
        { value: 'office_expense', label: 'Despesa Escritório', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800' }
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
      receipt: null
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

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transactionData = {
        ...formData,
        id: Date.now().toString(),
        amount: amount,
        status: 'completed' as const,
        userId: user?.id || '',
        userName: user?.name || 'Usuário'
      };
      
      console.log('Transaction submitted:', transactionData);
      
      const typeText = formData.type === 'income' ? 'Entrada' : 'Saída';
      showSuccess(
        'Transação Registrada', 
        `${typeText} de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrada com sucesso!`
      );
      
      resetForm();
      onTransactionSubmitted?.();
    } catch (error) {
      showError('Erro', 'Erro ao registrar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <Badge
                key={category.value}
                className={`cursor-pointer ${
                  formData.category === category.value 
                    ? 'bg-blue-600 text-white' 
                    : category.color
                }`}
                onClick={() => setFormData({...formData, category: category.value as TransactionCategory})}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

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
            {isLoading ? 'Registrando...' : 'Registrar Transação'}
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
