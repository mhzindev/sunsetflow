
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertConfig, useAlerts } from '@/hooks/useAlerts';
import { AlertCircle, TrendingUp, DollarSign, Users, Edit, Trash2, Clock } from 'lucide-react';

interface AlertsListProps {
  onEditAlert: (alert: AlertConfig) => void;
}

export const AlertsList = ({ onEditAlert }: AlertsListProps) => {
  const { alertConfigs, updateAlert, deleteAlert } = useAlerts();

  const getTypeIcon = (type: AlertConfig['type']) => {
    switch (type) {
      case 'payment': return AlertCircle;
      case 'goal': return TrendingUp;
      case 'cashflow': return DollarSign;
      case 'expense': return Users;
    }
  };

  const getTypeColor = (type: AlertConfig['type']) => {
    switch (type) {
      case 'payment': return 'text-red-600';
      case 'goal': return 'text-blue-600';
      case 'cashflow': return 'text-green-600';
      case 'expense': return 'text-orange-600';
    }
  };

  const getFrequencyLabel = (frequency: AlertConfig['frequency']) => {
    switch (frequency) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
    }
  };

  const formatCondition = (alert: AlertConfig) => {
    switch (alert.type) {
      case 'payment':
        return `${alert.threshold} pagamento(s) em atraso • ${alert.daysAdvance} dias de antecedência`;
      case 'goal':
        return `Meta: R$ ${alert.conditions.value.toLocaleString('pt-BR')}`;
      case 'cashflow':
        return `Saldo mínimo: R$ ${alert.conditions.value.toLocaleString('pt-BR')}`;
      case 'expense':
        return `Limite: R$ ${alert.conditions.value.toLocaleString('pt-BR')}`;
    }
  };

  if (alertConfigs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum alerta configurado</h3>
        <p className="text-gray-500">Configure alertas para receber notificações automáticas sobre eventos importantes.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alertConfigs.map((alert) => {
        const Icon = getTypeIcon(alert.type);
        const colorClass = getTypeColor(alert.type);
        
        return (
          <Card key={alert.id} className={`p-4 ${!alert.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{alert.name}</h4>
                    {!alert.isActive && (
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {formatCondition(alert)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getFrequencyLabel(alert.frequency)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span>Notificações:</span>
                      {alert.notifications.system && <Badge variant="outline" className="text-xs px-1">Sistema</Badge>}
                      {alert.notifications.email && <Badge variant="outline" className="text-xs px-1">Email</Badge>}
                    </div>
                  </div>
                  
                  {alert.lastTriggered && (
                    <p className="text-xs text-gray-400 mt-1">
                      Último disparo: {new Date(alert.lastTriggered).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={alert.isActive}
                  onCheckedChange={(checked) => updateAlert(alert.id, { isActive: checked })}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditAlert(alert)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAlert(alert.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
