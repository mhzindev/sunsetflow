
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, Save, X, CreditCard, Building2, Receipt, Calculator } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { AccountOption } from '@/types/account';

interface EnhancedExpenseFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const EnhancedExpenseForm: React.FC<EnhancedExpenseFormProps> = ({ onSave, onCancel }) => {
  const { user } = useAuth();
  const { insertExpense, fetchMissions, fetchBankAccounts, fetchCreditCards } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  const [missions, setMissions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    missionId: '',
    description: '',
    amount: '',
    receiptAmount: '',
    actualAmount: '',
    category: '',
    date: new Date(),
    isAdvanced: false,
    accountId: '',
    accountType: '' as 'bank_account' | 'credit_card' | '',
    accommodationDetails: {
      outsourcingCompany: '',
      invoiceNumber: '',
      notes: ''
    }
  });

  const categories = [
    { value: 'fuel', label: 'Combustível', icon: '⛽' },
    { value: 'accommodation', label: 'Hospedagem', icon: '🏨', hasDetails: true },
    { value: 'meals', label: 'Alimentação', icon: '🍽️' },
    { value: 'transportation', label: 'Deslocamento', icon: '🚗', hasDetails: true },
    { value: 'materials', label: 'Materiais', icon: '🔧' },
    { value: 'maintenance', label: 'Manutenção', icon: '⚙️' },
    { value: 'other', label: 'Outros', icon: '📝' }
  ];

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [missionsData, bankAccountsData, creditCardsData] = await Promise.all([
        fetchMissions(),
        fetchBankAccounts(),
        fetchCreditCards()
      ]);

      setMissions(missionsData);

      // Formatar contas para seleção
      const accountOptions: AccountOption[] = [
        ...bankAccountsData.map((account: any) => ({
          id: account.id,
          name: account.name,
          type: 'bank_account' as const,
          displayName: `${account.bank} - ${account.name} (Saldo: R$ ${account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
          available: account.balance
        })),
        ...creditCardsData.map((card: any) => ({
          id: card.id,
          name: card.name,
          type: 'credit_card' as const,
          displayName: `${card.brand.toUpperCase()} - ${card.name} (Disponível: R$ ${card.available_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
          available: card.available_limit
        }))
      ];

      setAccounts(accountOptions);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Erro ao carregar dados do formulário');
    } finally {
      setLoadingData(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const showDetailedAmounts = selectedCategory?.hasDetails;

  const handleAccountChange = (value: string) => {
    if (value === 'none') {
      setFormData({
        ...formData,
        accountId: '',
        accountType: ''
      });
      return;
    }
    
    const selectedAccount = accounts.find(acc => acc.id === value);
    if (selectedAccount) {
      setFormData({
        ...formData,
        accountId: value,
        accountType: selectedAccount.type
      });
    }
  };

  const calculateNetAmount = () => {
    const receipt = parseFloat(formData.receiptAmount) || 0;
    const actual = parseFloat(formData.actualAmount) || 0;
    return receipt - actual;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.amount || !formData.category) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Valor Inválido', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    if (showDetailedAmounts) {
      const receiptAmount = parseFloat(formData.receiptAmount);
      const actualAmount = parseFloat(formData.actualAmount);
      
      if (!receiptAmount || !actualAmount) {
        showError('Valores Obrigatórios', 'Para despesas de hospedagem e deslocamento, informe o valor da nota e o valor gasto');
        return;
      }
    }

    setIsLoading(true);

    try {
      const expenseData = {
        mission_id: formData.missionId || undefined,
        category: formData.category,
        description: formData.description,
        amount: amount,
        receipt_amount: showDetailedAmounts ? parseFloat(formData.receiptAmount) || null : null,
        actual_amount: showDetailedAmounts ? parseFloat(formData.actualAmount) || null : null,
        date: format(formData.date, 'yyyy-MM-dd'),
        is_advanced: formData.isAdvanced,
        account_id: formData.accountId || undefined,
        account_type: formData.accountType || undefined,
        accommodation_details: showDetailedAmounts ? {
          outsourcingCompany: formData.accommodationDetails.outsourcingCompany,
          invoiceNumber: formData.accommodationDetails.invoiceNumber,
          notes: formData.accommodationDetails.notes,
          receiptAmount: parseFloat(formData.receiptAmount) || 0,
          actualAmount: parseFloat(formData.actualAmount) || 0,
          netAmount: calculateNetAmount()
        } : undefined,
        employee_role: 'Funcionário'
      };

      const result = await insertExpense(expenseData);

      if (result.error) {
        throw new Error(result.error);
      }

      showSuccess('Despesa Registrada', 'A despesa foi registrada com sucesso!');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      showError('Erro', 'Erro ao registrar despesa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Nova Despesa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Missão */}
          <div>
            <Label htmlFor="mission">Missão (Opcional)</Label>
            <Select value={formData.missionId} onValueChange={(value) => setFormData({...formData, missionId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma missão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma missão</SelectItem>
                {missions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title} - {mission.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div>
            <Label>Categoria *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {categories.map((category) => (
                <div
                  key={category.value}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:border-blue-300",
                    formData.category === category.value 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200"
                  )}
                  onClick={() => setFormData({...formData, category: category.value})}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-sm font-medium">{category.label}</div>
                    {category.hasDetails && (
                      <Badge variant="secondary" className="text-xs mt-1">Detalhado</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Detalhes da despesa"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              required
            />
          </div>

          {/* Valores */}
          <div className="space-y-4">
            {showDetailedAmounts ? (
              <div>
                <Label className="text-base font-medium mb-3 block">Valores Detalhados</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiptAmount" className="flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Valor da Nota/Recibo *
                    </Label>
                    <Input
                      id="receiptAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.receiptAmount}
                      onChange={(e) => setFormData({...formData, receiptAmount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualAmount" className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Valor Gasto Real *
                    </Label>
                    <Input
                      id="actualAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.actualAmount}
                      onChange={(e) => setFormData({...formData, actualAmount: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                {formData.receiptAmount && formData.actualAmount && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Valor Líquido:</span>
                      <span className={cn(
                        "font-bold",
                        calculateNetAmount() >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {calculateNetAmount() >= 0 ? '+' : ''}R$ {calculateNetAmount().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {calculateNetAmount() >= 0 ? 'Economia realizada' : 'Valor excedente'}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="amount">Valor para Reembolso *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
            )}
          </div>

          {/* Conta/Cartão para Pagamento */}
          <div>
            <Label htmlFor="account">Conta/Cartão Utilizado</Label>
            <Select value={formData.accountId || 'none'} onValueChange={handleAccountChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione conta ou cartão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informado</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      {account.type === 'bank_account' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      {account.displayName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detalhes adicionais para hospedagem e deslocamento */}
          {showDetailedAmounts && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Detalhes Adicionais</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outsourcingCompany">Empresa/Fornecedor</Label>
                  <Input
                    id="outsourcingCompany"
                    value={formData.accommodationDetails.outsourcingCompany}
                    onChange={(e) => setFormData({
                      ...formData,
                      accommodationDetails: {
                        ...formData.accommodationDetails,
                        outsourcingCompany: e.target.value
                      }
                    })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Número da Nota/Fatura</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.accommodationDetails.invoiceNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      accommodationDetails: {
                        ...formData.accommodationDetails,
                        invoiceNumber: e.target.value
                      }
                    })}
                    placeholder="Número da nota fiscal"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.accommodationDetails.notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    accommodationDetails: {
                      ...formData.accommodationDetails,
                      notes: e.target.value
                    }
                  })}
                  placeholder="Informações adicionais"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Data */}
          <div>
            <Label>Data da Despesa *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({...formData, date})}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Adiantamento */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isAdvanced"
              checked={formData.isAdvanced}
              onCheckedChange={(checked) => setFormData({...formData, isAdvanced: checked})}
            />
            <Label htmlFor="isAdvanced">Esta é uma despesa com adiantamento</Label>
          </div>

          {/* Ações */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Registrar Despesa'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
