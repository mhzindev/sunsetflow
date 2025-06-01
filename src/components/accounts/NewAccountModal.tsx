
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from "@/hooks/use-toast";

interface NewAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export const NewAccountModal = ({ open, onClose }: NewAccountModalProps) => {
  const { addBankAccount } = useAccounts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    accountType: 'checking' as 'checking' | 'savings' | 'investment',
    accountNumber: '',
    agency: '',
    balance: 0,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addBankAccount(formData);
      
      if (result.success) {
        toast({
          title: "Conta adicionada",
          description: "A conta bancária foi criada com sucesso.",
        });
        onClose();
        setFormData({
          name: '',
          bank: '',
          accountType: 'checking',
          accountNumber: '',
          agency: '',
          balance: 0,
          isActive: true
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível criar a conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar a conta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta Bancária</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Conta Corrente Principal"
              required
            />
          </div>

          <div>
            <Label htmlFor="bank">Banco</Label>
            <Input
              id="bank"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              placeholder="Ex: Banco do Brasil"
              required
            />
          </div>

          <div>
            <Label htmlFor="accountType">Tipo de Conta</Label>
            <Select 
              value={formData.accountType} 
              onValueChange={(value: 'checking' | 'savings' | 'investment') => 
                setFormData({ ...formData, accountType: value })
              }
            >
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                placeholder="1234-5"
                required
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Conta</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="12345-6"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="balance">Saldo Inicial</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
