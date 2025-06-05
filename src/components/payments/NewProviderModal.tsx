
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';

interface NewProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewProviderModal = ({ isOpen, onClose, onSuccess }: NewProviderModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { company } = useCompany();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    cpf_cnpj: '',
    address: '',
    hourly_rate: '',
    payment_method: 'pix' as const,
    specialties: '',
    has_system_access: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada. Verifique se você está associado a uma empresa.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Criando prestador com company_id:', company.id);
      
      // Criar prestador com company_id
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          cpf_cnpj: formData.cpf_cnpj || null,
          address: formData.address || null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          payment_method: formData.payment_method,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : null,
          has_system_access: formData.has_system_access,
          company_id: company.id // Vincular à empresa
        })
        .select()
        .single();

      if (providerError) {
        console.error('Erro ao criar prestador:', providerError);
        throw providerError;
      }

      console.log('Prestador criado:', providerData);

      // Se tem acesso ao sistema, criar registro de acesso
      if (formData.has_system_access) {
        const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const password = Math.random().toString(36).substring(2, 10);
        const passwordHash = btoa(password); // Encoding simples

        const { error: accessError } = await supabase
          .from('service_provider_access')
          .insert({
            provider_id: providerData.id,
            email: formData.email,
            access_code: accessCode,
            password_hash: passwordHash,
            company_id: company.id, // Vincular à empresa
            is_active: true
          });

        if (accessError) {
          console.error('Erro ao criar acesso:', accessError);
          throw accessError;
        }

        toast({
          title: "Prestador criado com sucesso!",
          description: `Código de acesso: ${accessCode} (Senha: ${password})`,
        });
      } else {
        toast({
          title: "Prestador criado com sucesso!",
          description: "Prestador cadastrado sem acesso ao sistema.",
        });
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        cpf_cnpj: '',
        address: '',
        hourly_rate: '',
        payment_method: 'pix' as const,
        specialties: '',
        has_system_access: false
      });

      onSuccess();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o prestador. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        cpf_cnpj: '',
        address: '',
        hourly_rate: '',
        payment_method: 'pix' as const,
        specialties: '',
        has_system_access: false
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Prestador de Serviço</DialogTitle>
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
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="hourly_rate">Valor/Hora (R$)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="payment_method">Método de Pagamento *</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value: any) => setFormData({...formData, payment_method: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
              placeholder="Ex: Fotografia, Vídeo, Edição"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="has_system_access"
              checked={formData.has_system_access}
              onCheckedChange={(checked) => setFormData({...formData, has_system_access: checked})}
            />
            <Label htmlFor="has_system_access">Conceder acesso ao sistema</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Prestador"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
