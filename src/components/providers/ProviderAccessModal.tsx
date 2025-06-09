import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Copy, Check } from 'lucide-react';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { validateInput, sanitizeInput } from '@/utils/securityValidation';
import { supabase } from '@/integrations/supabase/client';

interface ProviderAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
  onSuccess: () => void;
}

export const ProviderAccessModal = ({
  isOpen,
  onClose,
  provider,
  onSuccess
}: ProviderAccessModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const { insertServiceProvider } = useSupabaseData();
  const { validatePermission } = useSecureAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [accessCreated, setAccessCreated] = useState(false);
  const [accessData, setAccessData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    canCreateExpenses: true,
    canViewMissions: true,
    canUpdateMissions: false,
    specialties: '',
    hourlyRate: '',
    cpfCnpj: '',
    address: ''
  });

  const generateSecureAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      showSuccess('Copiado!', 'Texto copiado para a área de transferência');
    } catch (error) {
      showError('Erro', 'Não foi possível copiar o texto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Security validation
    if (!validatePermission('admin')) {
      return;
    }

    // Input validation
    if (!validateInput(formData.email, 'email')) {
      showError('Erro de Validação', 'Email inválido');
      return;
    }

    if (formData.password.length < 8) {
      showError('Senha Inválida', 'A senha deve ter pelo menos 8 caracteres');
      return;
    }

    // Sanitize inputs
    const sanitizedFormData = {
      ...formData,
      email: sanitizeInput(formData.email.toLowerCase()),
      specialties: sanitizeInput(formData.specialties),
      cpfCnpj: sanitizeInput(formData.cpfCnpj),
      address: sanitizeInput(formData.address)
    };

    setIsLoading(true);

    try {
      const accessCode = generateSecureAccessCode();
      const permissions = {
        can_create_expenses: sanitizedFormData.canCreateExpenses,
        can_view_missions: sanitizedFormData.canViewMissions,
        can_update_missions: sanitizedFormData.canUpdateMissions
      };

      // Create access using edge function for secure password hashing
      const { data: newAccess, error: accessError } = await supabase.functions.invoke('create-provider-access', {
        body: {
          provider_id: provider.id,
          email: sanitizedFormData.email,
          password: sanitizedFormData.password,
          access_code: accessCode,
          permissions
        }
      });

      if (accessError) {
        throw new Error(accessError.message || 'Erro ao criar acesso');
      }

      // Update provider data
      const updatedProvider = {
        ...provider,
        has_system_access: true,
        specialties: sanitizedFormData.specialties.split(',').map(s => s.trim()).filter(s => s),
        hourly_rate: sanitizedFormData.hourlyRate ? parseFloat(sanitizedFormData.hourlyRate) : null,
        cpf_cnpj: sanitizedFormData.cpfCnpj,
        address: sanitizedFormData.address
      };

      setAccessData({
        ...newAccess,
        access_code: accessCode,
        email: sanitizedFormData.email,
        permissions
      });
      setAccessCreated(true);
      
      showSuccess('Acesso Criado!', 'Acesso ao sistema criado com sucesso para o prestador');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar acesso');
      showError('Erro', 'Erro ao criar acesso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAccessCreated(false);
    setAccessData(null);
    setFormData({
      email: '',
      password: '',
      canCreateExpenses: true,
      canViewMissions: true,
      canUpdateMissions: false,
      specialties: '',
      hourlyRate: '',
      cpfCnpj: '',
      address: ''
    });
    onClose();
  };

  if (accessCreated && accessData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              Acesso Criado com Sucesso!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 mb-3">
                Compartilhe estas credenciais com o prestador:
              </p>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-green-700">Email de Acesso:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-white px-2 py-1 rounded text-sm border flex-1">
                      {accessData.email}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accessData.email, 'email')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedField === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-green-700">Código de Acesso:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-white px-2 py-1 rounded text-sm border flex-1 font-mono">
                      {accessData.access_code}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accessData.access_code, 'code')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedField === 'code' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Importante:</strong> O prestador deve usar essas credenciais para acessar 
                o portal de prestadores e registrar despesas e acompanhar missões.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Permissões Concedidas:</Label>
              <div className="flex flex-wrap gap-1">
                {accessData.permissions.can_create_expenses && (
                  <Badge variant="secondary" className="text-xs">Criar Despesas</Badge>
                )}
                {accessData.permissions.can_view_missions && (
                  <Badge variant="secondary" className="text-xs">Ver Missões</Badge>
                )}
                {accessData.permissions.can_update_missions && (
                  <Badge variant="secondary" className="text-xs">Atualizar Missões</Badge>
                )}
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Acesso ao Sistema para {provider?.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email de Acesso *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@prestador.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha Segura *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input
                id="cpfCnpj"
                value={formData.cpfCnpj}
                onChange={(e) => setFormData({...formData, cpfCnpj: e.target.value})}
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <Label htmlFor="hourlyRate">Valor Hora (R$)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                placeholder="150.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Endereço completo do prestador"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="specialties">Especialidades</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
              placeholder="Instalação, Manutenção, Configuração (separadas por vírgula)"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Permissões do Sistema</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Criar Despesas</p>
                  <p className="text-sm text-gray-600">Permitir registrar novas despesas</p>
                </div>
                <Switch
                  checked={formData.canCreateExpenses}
                  onCheckedChange={(checked) => setFormData({...formData, canCreateExpenses: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Visualizar Missões</p>
                  <p className="text-sm text-gray-600">Acessar lista de missões designadas</p>
                </div>
                <Switch
                  checked={formData.canViewMissions}
                  onCheckedChange={(checked) => setFormData({...formData, canViewMissions: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Atualizar Missões</p>
                  <p className="text-sm text-gray-600">Modificar status e informações das missões</p>
                </div>
                <Switch
                  checked={formData.canUpdateMissions}
                  onCheckedChange={(checked) => setFormData({...formData, canUpdateMissions: checked})}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Criando Acesso...' : 'Criar Acesso ao Sistema'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
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
