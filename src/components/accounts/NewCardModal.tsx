
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from '@/hooks/useAccounts';
import { useToast } from "@/hooks/use-toast";

interface NewCardModalProps {
  open: boolean;
  onClose: () => void;
}

export const NewCardModal = ({ open, onClose }: NewCardModalProps) => {
  const { addCreditCard } = useAccounts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    cardNumber: '',
    brand: 'visa' as 'visa' | 'mastercard' | 'elo' | 'amex' | 'other',
    limit: 0,
    dueDate: 15,
    closingDate: 10,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addCreditCard(formData);
      
      if (result.success) {
        toast({
          title: "Cartão adicionado",
          description: "O cartão de crédito foi criado com sucesso.",
        });
        onClose();
        setFormData({
          name: '',
          bank: '',
          cardNumber: '',
          brand: 'visa',
          limit: 0,
          dueDate: 15,
          closingDate: 10,
          isActive: true
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível criar o cartão.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar o cartão.",
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
          <DialogTitle>Novo Cartão de Crédito</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Cartão Empresarial"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardNumber">Últimos 4 dígitos</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                placeholder="1234"
                maxLength={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Bandeira</Label>
              <Select 
                value={formData.brand} 
                onValueChange={(value: 'visa' | 'mastercard' | 'elo' | 'amex' | 'other') => 
                  setFormData({ ...formData, brand: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="elo">Elo</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="limit">Limite</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="closingDate">Dia do Fechamento</Label>
              <Input
                id="closingDate"
                type="number"
                min="1"
                max="31"
                value={formData.closingDate}
                onChange={(e) => setFormData({ ...formData, closingDate: parseInt(e.target.value) || 10 })}
                required
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
                onChange={(e) => setFormData({ ...formData, dueDate: parseInt(e.target.value) || 15 })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Cartão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
