
import { useState, useEffect } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export interface AlertConfig {
  id: string;
  type: 'payment' | 'goal' | 'cashflow' | 'expense';
  name: string;
  isActive: boolean;
  threshold?: number;
  daysAdvance?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  notifications: {
    email: boolean;
    system: boolean;
  };
  conditions: {
    operator: 'greater' | 'less' | 'equal';
    value: number;
    period?: 'day' | 'week' | 'month';
  };
  createdAt: string;
  lastTriggered?: string;
}

export interface ActiveAlert {
  id: string;
  configId: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  triggeredAt: string;
  acknowledged: boolean;
  value?: number;
  threshold?: number;
}

export const useAlerts = () => {
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const { data } = useFinancial();
  const { showSuccess, showError, showInfo } = useToastFeedback();

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfigs = localStorage.getItem('alertConfigs');
    if (savedConfigs) {
      setAlertConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('alertConfigs', JSON.stringify(alertConfigs));
  }, [alertConfigs]);

  // Verificar alertas automaticamente
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: ActiveAlert[] = [];
      const now = new Date();

      alertConfigs.forEach(config => {
        if (!config.isActive) return;

        const lastCheck = config.lastTriggered ? new Date(config.lastTriggered) : new Date(0);
        const shouldCheck = now.getTime() - lastCheck.getTime() > getFrequencyMs(config.frequency);

        if (!shouldCheck) return;

        switch (config.type) {
          case 'payment':
            checkPaymentAlerts(config, newAlerts);
            break;
          case 'goal':
            checkGoalAlerts(config, newAlerts);
            break;
          case 'cashflow':
            checkCashflowAlerts(config, newAlerts);
            break;
          case 'expense':
            checkExpenseAlerts(config, newAlerts);
            break;
        }
      });

      if (newAlerts.length > 0) {
        setActiveAlerts(prev => [...prev, ...newAlerts]);
        newAlerts.forEach(alert => {
          if (alert.priority === 'high') {
            showError(alert.title, alert.description);
          } else if (alert.priority === 'medium') {
            showInfo(alert.title, alert.description);
          } else {
            showSuccess(alert.title, alert.description);
          }
        });
      }
    };

    const interval = setInterval(checkAlerts, 60000); // Verificar a cada minuto
    checkAlerts(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, [alertConfigs, data]);

  const checkPaymentAlerts = (config: AlertConfig, alerts: ActiveAlert[]) => {
    const overduePayments = data.payments.filter(p => p.status === 'overdue');
    const pendingPayments = data.payments.filter(p => p.status === 'pending');
    
    // Pagamentos em atraso
    if (overduePayments.length >= (config.threshold || 1)) {
      const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);
      alerts.push({
        id: Date.now().toString(),
        configId: config.id,
        type: 'error',
        title: 'Pagamentos em Atraso',
        description: `${overduePayments.length} pagamentos atrasados totalizando R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        priority: 'high',
        triggeredAt: new Date().toISOString(),
        acknowledged: false,
        value: overduePayments.length,
        threshold: config.threshold
      });
    }

    // Pagamentos próximos do vencimento
    const upcomingPayments = pendingPayments.filter(p => {
      const dueDate = new Date(p.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= (config.daysAdvance || 7);
    });

    if (upcomingPayments.length > 0) {
      alerts.push({
        id: (Date.now() + 1).toString(),
        configId: config.id,
        type: 'warning',
        title: 'Pagamentos Próximos do Vencimento',
        description: `${upcomingPayments.length} pagamentos vencem nos próximos ${config.daysAdvance || 7} dias`,
        priority: 'medium',
        triggeredAt: new Date().toISOString(),
        acknowledged: false
      });
    }
  };

  const checkGoalAlerts = (config: AlertConfig, alerts: ActiveAlert[]) => {
    const targetRevenue = config.conditions.value;
    const currentRevenue = data.monthlyIncome;
    const progress = targetRevenue > 0 ? (currentRevenue / targetRevenue) * 100 : 0;

    if (config.conditions.operator === 'less' && currentRevenue < targetRevenue) {
      alerts.push({
        id: Date.now().toString(),
        configId: config.id,
        type: progress < 50 ? 'error' : 'warning',
        title: 'Meta de Receita',
        description: `Receita atual (R$ ${currentRevenue.toLocaleString('pt-BR')}) está ${progress.toFixed(1)}% da meta (R$ ${targetRevenue.toLocaleString('pt-BR')})`,
        priority: progress < 50 ? 'high' : 'medium',
        triggeredAt: new Date().toISOString(),
        acknowledged: false,
        value: currentRevenue,
        threshold: targetRevenue
      });
    }
  };

  const checkCashflowAlerts = (config: AlertConfig, alerts: ActiveAlert[]) => {
    const currentBalance = data.totalBalance;
    const minimumBalance = config.conditions.value;

    if (config.conditions.operator === 'less' && currentBalance < minimumBalance) {
      alerts.push({
        id: Date.now().toString(),
        configId: config.id,
        type: 'error',
        title: 'Saldo Baixo',
        description: `Saldo atual (R$ ${currentBalance.toLocaleString('pt-BR')}) está abaixo do mínimo (R$ ${minimumBalance.toLocaleString('pt-BR')})`,
        priority: 'high',
        triggeredAt: new Date().toISOString(),
        acknowledged: false,
        value: currentBalance,
        threshold: minimumBalance
      });
    }
  };

  const checkExpenseAlerts = (config: AlertConfig, alerts: ActiveAlert[]) => {
    const monthlyExpenses = data.monthlyExpenses;
    const expenseLimit = config.conditions.value;

    if (config.conditions.operator === 'greater' && monthlyExpenses > expenseLimit) {
      alerts.push({
        id: Date.now().toString(),
        configId: config.id,
        type: 'warning',
        title: 'Limite de Despesas Excedido',
        description: `Despesas do mês (R$ ${monthlyExpenses.toLocaleString('pt-BR')}) excederam o limite (R$ ${expenseLimit.toLocaleString('pt-BR')})`,
        priority: 'medium',
        triggeredAt: new Date().toISOString(),
        acknowledged: false,
        value: monthlyExpenses,
        threshold: expenseLimit
      });
    }
  };

  const getFrequencyMs = (frequency: AlertConfig['frequency']): number => {
    switch (frequency) {
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  };

  const createAlert = (config: Omit<AlertConfig, 'id' | 'createdAt'>) => {
    const newAlert: AlertConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAlertConfigs(prev => [...prev, newAlert]);
    showSuccess('Alerta Criado', `Alerta "${config.name}" foi configurado com sucesso`);
  };

  const updateAlert = (id: string, updates: Partial<AlertConfig>) => {
    setAlertConfigs(prev => prev.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ));
    showSuccess('Alerta Atualizado', 'Configuração do alerta foi salva');
  };

  const deleteAlert = (id: string) => {
    setAlertConfigs(prev => prev.filter(alert => alert.id !== id));
    showSuccess('Alerta Removido', 'Alerta foi excluído com sucesso');
  };

  const acknowledgeAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return {
    alertConfigs,
    activeAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    dismissAlert
  };
};
