
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mission, MissionWithProvider, MissionProgress } from '@/types/mission';
import { useToastFeedback } from './useToastFeedback';

export const useMissionData = () => {
  const { showError } = useToastFeedback();
  const [missions, setMissions] = useState<MissionWithProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMissionWithProvider = async (missionId: string): Promise<MissionWithProvider | null> => {
    try {
      console.log('Buscando missão com prestador:', missionId);
      
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (missionError) {
        console.error('Erro ao buscar missão:', missionError);
        return null;
      }

      let missionWithProvider: MissionWithProvider = { ...mission };

      // Buscar dados do prestador principal se existir
      if (mission.provider_id) {
        const { data: provider, error: providerError } = await supabase
          .from('service_providers')
          .select('id, name, email, phone, service')
          .eq('id', mission.provider_id)
          .single();

        if (!providerError && provider) {
          missionWithProvider.provider = provider;
        }
      }

      // Buscar dados dos prestadores designados
      if (mission.assigned_providers && mission.assigned_providers.length > 0) {
        const { data: assignedProviders, error: assignedError } = await supabase
          .from('service_providers')
          .select('id, name, email, phone, service')
          .in('id', mission.assigned_providers);

        if (!assignedError && assignedProviders) {
          missionWithProvider.assigned_providers_details = assignedProviders;
        }
      }

      console.log('Missão carregada com prestador:', missionWithProvider);
      return missionWithProvider;
    } catch (error) {
      console.error('Erro inesperado ao buscar missão:', error);
      return null;
    }
  };

  const fetchAllMissions = async (): Promise<MissionWithProvider[]> => {
    setIsLoading(true);
    try {
      console.log('Buscando todas as missões com prestadores...');
      
      const { data: missions, error } = await supabase
        .from('missions')
        .select(`
          *,
          provider:service_providers!missions_provider_id_fkey(
            id, name, email, phone, service
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar missões:', error);
        showError('Erro', 'Erro ao carregar missões');
        return [];
      }

      // Para cada missão, buscar os prestadores designados
      const missionsWithProviders = await Promise.all(
        missions.map(async (mission) => {
          let missionWithProvider: MissionWithProvider = { ...mission };

          if (mission.assigned_providers && mission.assigned_providers.length > 0) {
            const { data: assignedProviders } = await supabase
              .from('service_providers')
              .select('id, name, email, phone, service')
              .in('id', mission.assigned_providers);

            if (assignedProviders) {
              missionWithProvider.assigned_providers_details = assignedProviders;
            }
          }

          return missionWithProvider;
        })
      );

      console.log('Missões carregadas com prestadores:', missionsWithProviders.length);
      setMissions(missionsWithProviders);
      return missionsWithProviders;
    } catch (error) {
      console.error('Erro inesperado ao buscar missões:', error);
      showError('Erro', 'Erro inesperado ao carregar missões');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMissionProgress = (mission: Mission): MissionProgress => {
    // Lógica real de progresso baseada em despesas vs orçamento
    const budget = mission.budget || mission.service_value || 0;
    const expenses = mission.total_expenses || 0;
    
    if (budget <= 0) {
      return {
        percentage: 0,
        completedExpenses: expenses,
        totalBudget: budget,
        description: 'Orçamento não definido'
      };
    }

    // Se as despesas são menores que o orçamento, calcular % baseado em despesas
    if (expenses <= budget) {
      const percentage = Math.min((expenses / budget) * 100, 100);
      return {
        percentage: Math.round(percentage),
        completedExpenses: expenses,
        totalBudget: budget,
        description: `${Math.round(percentage)}% do orçamento utilizado`
      };
    }

    // Se excedeu o orçamento, mostrar 100% com indicação de excesso
    return {
      percentage: 100,
      completedExpenses: expenses,
      totalBudget: budget,
      description: `Orçamento excedido em R$ ${(expenses - budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    };
  };

  const updateMissionInList = (updatedMission: Mission) => {
    setMissions(prevMissions => 
      prevMissions.map(mission => 
        mission.id === updatedMission.id 
          ? { ...mission, ...updatedMission }
          : mission
      )
    );
  };

  return {
    missions,
    isLoading,
    fetchMissionWithProvider,
    fetchAllMissions,
    calculateMissionProgress,
    updateMissionInList
  };
};
