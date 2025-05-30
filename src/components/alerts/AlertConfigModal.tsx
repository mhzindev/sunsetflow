
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertConfig } from '@/hooks/useAlerts';
import { AlertCircle, TrendingUp, DollarSign, Users } from 'lucide-react';

interface AlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Omit<AlertConfig, 'id' | 'createdAt'>) => void;
  initialType?: AlertConfig['type'];
  editingAlert?: AlertConfig;
}

export const AlertConfigModal = ({ isOpen, onClose, onSave, initialType, editingAlert }: AlertConfigModalProps) => {
  const [config, setConfig] = useState<Omit<AlertConfig, 'id' | 'createdAt'>>(() => ({
    type: initialType || 'payment',
    name: '',
    isActive: true,
    frequency: 'daily',
    notifications: {
      email: false,
      system: true
    },
    conditions: {
      operator: 'greater',
      value: 0
    },
    threshold: 1,
    daysAdvance: 7,
    ...editingAlert
  }));

  const getTypeIcon = (type: AlertConfig['type']) => {
    switch (type) {
      case 'payment': return AlertCircle;
      case 'goal': return TrendingUp;
      case 'cashflow': return DollarSign;
      case 'expense': return Users;
    }
  };

  const getTypeTitle = (type: AlertConfig['type']) => {
    switch (type) {
      case 'payment': return 'Alerta de Pagamento';
      case 'goal': return 'Alerta de Meta';
      case 'cashflow': return 'Alerta de Fluxo de Caixa';
      case 'expense': return 'Alerta de Despesas';
    }
  };

  const handleSave = () => {
    if (!config.name.trim()) return;
    onSave(config);
    onClose();
    setConfig({
      type: 'payment',
      name: '',
      isActive: true,
      frequency: 'daily',
      notifications: { email: false, system: true },
      conditions: { operator: 'greater', value: 0 },
      threshold: 1,
      daysAdvance: 7
    });
  };

  const Icon = getTypeIcon(config.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {editingAlert ? 'Editar' : 'Configurar'} {getTypeTitle(config.type)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do Alerta */}
          <div>
            <Label htmlFor="alert-name">Nome do Alerta</Label>
            <Input
              id="alert-name"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Pagamentos em atraso críticos"
            />
          </div>

          {/* Tipo de Alerta */}
          <div>
            <Label>Tipo de Alerta</Label>
            <Select 
              value={config.type} 
              onValueChange={(value: AlertConfig['type']) => 
                setConfig(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Pagamentos</SelectItem>
                <SelectItem value="goal">Metas</SelectItem>
                <SelectItem value="cashflow">Fluxo de Caixa</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Configurações específicas por tipo */}
          {config.type === 'payment' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="payment-threshold">Número mínimo de pagamentos em atraso</Label>
                <Input
                  id="payment-threshold"
                  type="number"
                  min="1"
                  value={config.threshold || 1}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    threshold: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="days-advance">Avisar com quantos dias de antecedência</Label>
                <Input
                  id="days-advance"
                  type="number"
                  min="1"
                  max="30"
                  value={config.daysAdvance || 7}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    daysAdvance: parseInt(e.target.value) || 7 
                  }))}
                />
              </div>
            </div>
          )}

          {config.type === 'goal' && (
            <div>
              <Label htmlFor="goal-value">Meta de receita mensal (R$)</Label>
              <Input
                id="goal-value"
                type="number"
                min="0"
                step="0.01"
                value={config.conditions.value}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  conditions: { ...prev.conditions, value: parseFloat(e.target.value) || 0 }
                }))}
              />
            </div>
          )}

          {config.type === 'cashflow' && (
            <div>
              <Label htmlFor="min-balance">Saldo mínimo em caixa (R$)</Label>
              <Input
                id="min-balance"
                type="number"
                min="0"
                step="0.01"
                value={config.conditions.value}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  conditions: { ...prev.conditions, value: parseFloat(e.target.value) || 0 }
                }))}
              />
            </div>
          )}

          {config.type === 'expense' && (
            <div>
              <Label htmlFor="expense-limit">Limite máximo de despesas mensais (R$)</Label>
              <Input
                id="expense-limit"
                type="number"
                min="0"
                step="0.01"
                value={config.conditions.value}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  conditions: { ...prev.conditions, value: parseFloat(e.target.value) || 0 }
                }))}
              />
            </div>
          )}

          <Separator />

          {/* Frequência */}
          <div>
            <Label>Frequência de Verificação</Label>
            <Select 
              value={config.frequency} 
              onValueChange={(value: AlertConfig['frequency']) => 
                setConfig(prev => ({ ...prev, frequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notificações */}
          <div className="space-y-3">
            <Label>Tipos de Notificação</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificação no sistema</span>
              <Switch
                checked={config.notifications.system}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, system: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificação por email</span>
              <Switch
                checked={config.notifications.email}
                onCheckedChange={(checked) => setConfig(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: checked }
                }))}
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between">
            <Label>Alerta ativo</Label>
            <Switch
              checked={config.isActive}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={!config.name.trim()}
          >
            {editingAlert ? 'Atualizar' : 'Criar'} Alerta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
