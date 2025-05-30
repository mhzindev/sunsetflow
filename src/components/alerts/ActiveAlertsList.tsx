
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActiveAlert, useAlerts } from '@/hooks/useAlerts';
import { AlertCircle, CheckCircle, TrendingUp, X, Info } from 'lucide-react';

export const ActiveAlertsList = () => {
  const { activeAlerts, acknowledgeAlert, dismissAlert } = useAlerts();

  const getAlertIcon = (type: ActiveAlert['type']) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'info': return Info;
    }
  };

  const getAlertColor = (type: ActiveAlert['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (type: ActiveAlert['type']) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
    }
  };

  const getPriorityLabel = (priority: ActiveAlert['priority']) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
    }
  };

  const unacknowledgedAlerts = activeAlerts.filter(alert => !alert.acknowledged);

  if (unacknowledgedAlerts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Todos os alertas estão em dia</h3>
        <p className="text-gray-500">Não há alertas ativos no momento.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {unacknowledgedAlerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        const cardColor = getAlertColor(alert.type);
        const iconColor = getIconColor(alert.type);
        
        return (
          <Card key={alert.id} className={`p-4 border-l-4 ${cardColor}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                    <Badge 
                      variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {getPriorityLabel(alert.priority)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                  
                  {alert.value !== undefined && alert.threshold !== undefined && (
                    <div className="text-xs text-gray-500 mb-2">
                      Valor atual: {alert.value.toLocaleString('pt-BR')} | 
                      Limite: {alert.threshold.toLocaleString('pt-BR')}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    {new Date(alert.triggeredAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-gray-600 hover:text-gray-800"
                  title="Marcar como lido"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-600 hover:text-gray-800"
                  title="Dispensar"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
