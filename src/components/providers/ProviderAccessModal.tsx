
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Copy, Check } from 'lucide-react';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useSupabaseData } from '@/hooks/useSupabaseData';

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

  const generateAccessCode = () => {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
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

    if (!formData.email || !formData.password) {
      showError('Erro de Validação', 'Email e senha são obrigatórios');
      return;
    }

    if (formData.password.length < 6) {
      showError('Senha Inválida', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const accessCode = generateAccessCode();
      const permissions = {
        can_create_expenses: formData.canCreateExpenses,
        can_view_missions: formData.canViewMissions,
        can_update_missions: formData.canUpdateMissions
      };

      // Simular criação do acesso (em produção, isso seria feito via Edge Function)
      const newAccess = {
        id: Date.now().toString(),
        provider_id: provider.id,
        email: formData.email,
        access_code: accessCode,
        permissions,
        created_at: new Date().toISOString(),
        is_active: true
      };

      // Atualizar dados do prestador
      const updatedProvider = {
        ...provider,
        has_system_access: true,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        cpf_cnpj: formData.cpfCnpj,
        address: formData.address
      };

      setAccessData(newAccess);
      setAccessCreated(true);
      
      showSuccess('Acesso Criado!', 'Acesso ao sistema criado com sucesso para o prestador');
      onSuccess();
    } catch (error) {
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
              <Label htmlFor="password">Senha Temporária *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Mínimo 6 caracteres"
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
