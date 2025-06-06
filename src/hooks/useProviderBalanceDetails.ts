
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';

interface BalanceDetails {
  currentBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalPaid: number;
  missionsCount: number;
  pendingMissionsCount: number;
}

export const useProviderBalanceDetails = (providerId: string) => {
  const [balanceDetails, setBalanceDetails] = useState<BalanceDetails>({
    currentBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalPaid: 0,
    missionsCount: 0,
    pendingMissionsCount: 0
  });
  const [loading, setLoading] = useState(false);
  const { showError } = useToastFeedback();

  const calculateBalanceDetails = async () => {
    if (!providerId) return;

    try {
      setLoading(true);

      // Buscar missões aprovadas do prestador
      const { data: approvedMissions, error: approvedError } = await supabase
        .from('missions')
        .select('id, provider_value, assigned_providers, provider_id')
        .eq('is_approved', true)
        .or(`provider_id.eq.${providerId},assigned_providers.cs.{${providerId}}`);

      if (approvedError) throw approvedError;

      // Buscar missões pendentes do prestador
      const { data: pendingMissions, error: pendingError } = await supabase
        .from('missions')
        .select('id, provider_value, assigned_providers, provider_id')
        .eq('is_approved', false)
        .or(`provider_id.eq.${providerId},assigned_providers.cs.{${providerId}}`);

      if (pendingError) throw pendingError;

      // Buscar pagamentos completados
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('provider_id', providerId)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      // Calcular valor ganho das missões aprovadas
      const totalEarned = approvedMissions?.reduce((sum, mission) => {
        let earnedValue = 0;
        
        if (mission.provider_id === providerId) {
          earnedValue = mission.provider_value;
        } else if (mission.assigned_providers?.includes(providerId)) {
          earnedValue = mission.provider_value / (mission.assigned_providers?.length || 1);
        }
        
        return sum + earnedValue;
      }, 0) || 0;

      // Calcular valor previsto das missões pendentes
      const pendingBalance = pendingMissions?.reduce((sum, mission) => {
        let pendingValue = 0;
        
        if (mission.provider_id === providerId) {
          pendingValue = mission.provider_value;
        } else if (mission.assigned_providers?.includes(providerId)) {
          pendingValue = mission.provider_value / (mission.assigned_providers?.length || 1);
        }
        
        return sum + pendingValue;
      }, 0) || 0;

      // Calcular total pago
      const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Saldo atual = total ganho - total pago
      const currentBalance = totalEarned - totalPaid;

      setBalanceDetails({
        currentBalance,
        pendingBalance,
        totalEarned,
        totalPaid,
        missionsCount: approvedMissions?.length || 0,
        pendingMissionsCount: pendingMissions?.length || 0
      });

    } catch (error) {
      console.error('Erro ao calcular detalhes do saldo:', error);
      showError('Erro', 'Erro ao calcular detalhes do saldo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      calculateBalanceDetails();
    }
  }, [providerId]);

  return {
    balanceDetails,
    loading,
    recalculate: calculateBalanceDetails
  };
};
