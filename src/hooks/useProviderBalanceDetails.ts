
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from './useToastFeedback';

interface BalanceDetails {
  availableBalance: number; // Saldo disponível (acumulado - pagamentos - recebimentos marcados)
  accumulatedBalance: number; // Saldo pendente/acumulado (total ganho)
  totalEarned: number; // Total ganho (mesmo que accumulatedBalance)
  totalPaid: number; // Total pago pela empresa
  totalMarkedAsReceived: number; // Total marcado como recebido pelo prestador
  missionsCount: number;
  pendingMissionsCount: number;
}

export const useProviderBalanceDetails = (providerId: string) => {
  const [balanceDetails, setBalanceDetails] = useState<BalanceDetails>({
    availableBalance: 0,
    accumulatedBalance: 0,
    totalEarned: 0,
    totalPaid: 0,
    totalMarkedAsReceived: 0,
    missionsCount: 0,
    pendingMissionsCount: 0
  });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToastFeedback();

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

      // Buscar recebimentos marcados pelo prestador
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('total_marked_as_received')
        .eq('id', providerId)
        .single();

      if (providerError && providerError.code !== 'PGRST116') throw providerError;

      // Calcular saldo acumulado (total ganho)
      const accumulatedBalance = approvedMissions?.reduce((sum, mission) => {
        let earnedValue = 0;
        
        if (mission.provider_id === providerId) {
          earnedValue = mission.provider_value;
        } else if (mission.assigned_providers?.includes(providerId)) {
          earnedValue = mission.provider_value / (mission.assigned_providers?.length || 1);
        }
        
        return sum + earnedValue;
      }, 0) || 0;

      // Calcular total pago pela empresa
      const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Total marcado como recebido pelo prestador
      const totalMarkedAsReceived = providerData?.total_marked_as_received || 0;

      // Saldo disponível = acumulado - pagamentos - marcados como recebidos
      const availableBalance = Math.max(0, accumulatedBalance - totalPaid - totalMarkedAsReceived);

      setBalanceDetails({
        availableBalance,
        accumulatedBalance,
        totalEarned: accumulatedBalance,
        totalPaid,
        totalMarkedAsReceived,
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

  const markAsReceived = async (amount: number) => {
    if (!providerId || amount <= 0) return { success: false };

    try {
      // Atualizar o campo total_marked_as_received na tabela service_providers
      const { error } = await supabase
        .from('service_providers')
        .update({
          total_marked_as_received: (balanceDetails.totalMarkedAsReceived + amount)
        })
        .eq('id', providerId);

      if (error) throw error;

      showSuccess('Sucesso', `Recebimento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)} marcado com sucesso!`);
      
      // Recalcular saldos
      await calculateBalanceDetails();
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar recebimento:', error);
      showError('Erro', 'Erro ao marcar recebimento');
      return { success: false };
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
    recalculate: calculateBalanceDetails,
    markAsReceived
  };
};
