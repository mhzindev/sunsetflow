
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  paymentMethod: string;
  active: boolean;
  totalPaid: number;
  lastPayment: string;
}

interface ProviderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onSuccess: (provider: Provider) => void;
}

export const ProviderEditModal = ({ 
  isOpen, 
  onClose, 
  provider, 
  onSuccess 
}: ProviderEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    paymentMethod: 'pix',
    active: true
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        service: provider.service,
        paymentMethod: provider.paymentMethod,
        active: provider.active
      });
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.service) {
      showError('Erro de Validação', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProvider = {
        ...provider!,
        ...formData
      };

      onSuccess(updatedProvider);
      showSuccess('Sucesso', 'Prestador atualizado com sucesso!');
      onClose();
    } catch (error) {
      showError('Erro', 'Erro ao atualizar prestador. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Prestador</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="service">Serviço *</Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => 
              setFormData({...formData, paymentMethod: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked})}
            />
            <Label htmlFor="active">Prestador Ativo</Label>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
