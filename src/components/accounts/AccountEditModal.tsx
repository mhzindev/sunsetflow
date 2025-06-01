
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BankAccount, CreditCard } from '@/types/account';
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from "@/hooks/use-toast";

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | CreditCard | null;
}

export const AccountEditModal = ({ isOpen, onClose, account }: AccountEditModalProps) => {
  const { updateBankAccount, updateCreditCard } = useAccounts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const isCreditCard = account && 'limit' in account;
  
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    accountType: 'checking',
    accountNumber: '',
    agency: '',
    balance: '',
    cardNumber: '',
    brand: 'visa',
    limit: '',
    dueDate: '',
    closingDate: '',
    isActive: true
  });

  useEffect(() => {
    if (account && isOpen) {
      if (isCreditCard) {
        const card = account as CreditCard;
        setFormData({
          name: card.name || '',
          bank: card.bank || '',
          accountType: 'checking',
          accountNumber: '',
          agency: '',
          balance: '',
          cardNumber: card.cardNumber || '',
          brand: card.brand || 'visa',
          limit: card.limit?.toString() || '',
          dueDate: card.dueDate?.toString() || '',
          closingDate: card.closingDate?.toString() || '',
          isActive: card.isActive ?? true
        });
      } else {
        const bankAccount = account as BankAccount;
        setFormData({
          name: bankAccount.name || '',
          bank: bankAccount.bank || '',
          accountType: bankAccount.accountType || 'checking',
          accountNumber: bankAccount.accountNumber || '',
          agency: bankAccount.agency || '',
          balance: bankAccount.balance?.toString() || '',
          cardNumber: '',
          brand: 'visa',
          limit: '',
          dueDate: '',
          closingDate: '',
          isActive: bankAccount.isActive ?? true
        });
      }
    }
  }, [account, isOpen, isCreditCard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    try {
      let result;
      
      if (isCreditCard) {
        result = await updateCreditCard(account.id, {
          name: formData.name,
          bank: formData.bank,
          cardNumber: formData.cardNumber,
          brand: formData.brand as any,
          limit: parseFloat(formData.limit) || 0,
          dueDate: parseInt(formData.dueDate) || 1,
          closingDate: parseInt(formData.closingDate) || 1,
          isActive: formData.isActive
        });
      } else {
        result = await updateBankAccount(account.id, {
          name: formData.name,
          bank: formData.bank,
          accountType: formData.accountType as any,
          accountNumber: formData.accountNumber,
          agency: formData.agency,
          balance: parseFloat(formData.balance) || 0,
          isActive: formData.isActive
        });
      }

      if (result.success) {
        toast({
          title: "Conta atualizada",
          description: "As alterações foram salvas com sucesso.",
        });
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao atualizar conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar conta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar {isCreditCard ? 'Cartão de Crédito' : 'Conta Bancária'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="bank">Banco *</Label>
              <Input
                id="bank"
                value={formData.bank}
                onChange={(e) => setFormData({...formData, bank: e.target.value})}
                required
              />
            </div>

            {!isCreditCard && (
              <>
                <div>
                  <Label htmlFor="accountType">Tipo de Conta *</Label>
                  <Select value={formData.accountType} onValueChange={(value) => 
                    setFormData({...formData, accountType: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="agency">Agência</Label>
                  <Input
                    id="agency"
                    value={formData.agency}
                    onChange={(e) => setFormData({...formData, agency: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Número da Conta</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="balance">Saldo Atual (R$)</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  />
                </div>
              </>
            )}

            {isCreditCard && (
              <>
                <div>
                  <Label htmlFor="cardNumber">Últimos 4 dígitos</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    maxLength={4}
                  />
                </div>

                <div>
                  <Label htmlFor="brand">Bandeira</Label>
                  <Select value={formData.brand} onValueChange={(value) => 
                    setFormData({...formData, brand: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="elo">Elo</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="limit">Limite (R$)</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({...formData, limit: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Dia do Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="closingDate">Dia do Fechamento</Label>
                  <Input
                    id="closingDate"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.closingDate}
                    onChange={(e) => setFormData({...formData, closingDate: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
            />
            <Label htmlFor="isActive">Conta ativa</Label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
