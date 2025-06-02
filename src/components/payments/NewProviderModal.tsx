
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Plus } from 'lucide-react';

interface NewProviderModalProps {
  onProviderCreated?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (newProvider: any) => void;
}

export const NewProviderModal = ({ onProviderCreated, isOpen, onClose, onSave }: NewProviderModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    payment_method: 'pix' as any
  });

  const { insertServiceProvider } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  // Use external open state if provided, otherwise use internal
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = isOpen !== undefined ? (onClose || (() => {})) : setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      showError('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      console.log('Criando novo prestador:', formData);
      
      const { data, error } = await insertServiceProvider(formData);
      
      if (error) {
        console.error('Erro ao criar prestador:', error);
        showError('Erro', `Erro ao criar prestador: ${error}`);
        return;
      }

      console.log('Prestador criado com sucesso:', data);
      showSuccess('Sucesso', 'Prestador criado com sucesso!');
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        payment_method: 'pix'
      });
      
      // Close modal
      if (isOpen !== undefined && onClose) {
        onClose();
      } else {
        setInternalOpen(false);
      }
      
      // Call callbacks
      onProviderCreated?.();
      onSave?.(data);
    } catch (error) {
      console.error('Erro inesperado ao criar prestador:', error);
      showError('Erro', 'Erro inesperado ao criar prestador');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isOpen !== undefined) {
      if (!newOpen && onClose) {
        onClose();
      }
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Prestador
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Prestador de Serviços</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do prestador"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <Label htmlFor="service">Serviço *</Label>
            <Input
              id="service"
              value={formData.service}
              onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
              placeholder="Ex: Instalação de rastreadores"
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_method">Método de Pagamento *</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, payment_method: value }))
              }
            >
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

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Prestador'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
