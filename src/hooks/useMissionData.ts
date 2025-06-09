
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Mission, MissionWithProvider, MissionProgress } from '@/types/mission';
import { useToastFeedback } from './useToastFeedback';

export const useMissionData = () => {
  const { showError, showSuccess } = useToastFeedback();
  const queryClient = useQueryClient();

  // Optimized single query to fetch mission with all provider details
  const fetchMissionWithProviderOptimized = async (missionId: string): Promise<MissionWithProvider | null> => {
    try {
      console.log('Fetching optimized mission data for:', missionId);
      
      // Single optimized query with JOINs
      const { data: mission, error } = await supabase
        .from('missions')
        .select(`
          *,
          provider:service_providers!missions_provider_id_fkey(
            id, name, email, phone, service
          )
        `)
        .eq('id', missionId)
        .single();

      if (error) {
        console.error('Error fetching mission:', error);
        return null;
      }

      let missionWithProvider: MissionWithProvider = { ...mission };

      // Fetch assigned providers if they exist (separate query for array IDs)
      if (mission.assigned_providers && mission.assigned_providers.length > 0) {
        const { data: assignedProviders } = await supabase
          .from('service_providers')
          .select('id, name, email, phone, service')
          .in('id', mission.assigned_providers);

        if (assignedProviders) {
          missionWithProvider.assigned_providers_details = assignedProviders;
        }
      }

      console.log('Optimized mission data loaded:', missionWithProvider);
      return missionWithProvider;
    } catch (error) {
      console.error('Unexpected error fetching mission:', error);
      return null;
    }
  };

  // React Query hook for single mission
  const useMissionQuery = (missionId: string | null) => {
    return useQuery({
      queryKey: ['mission', missionId],
      queryFn: () => missionId ? fetchMissionWithProviderOptimized(missionId) : null,
      enabled: !!missionId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
    });
  };

  // Optimized query for all missions
  const useAllMissionsQuery = () => {
    return useQuery({
      queryKey: ['missions'],
      queryFn: async (): Promise<MissionWithProvider[]> => {
        console.log('Fetching all missions with providers...');
        
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
          console.error('Error fetching missions:', error);
          showError('Erro', 'Erro ao carregar missões');
          return [];
        }

        // Process assigned providers for all missions
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

        console.log('All missions loaded:', missionsWithProviders.length);
        return missionsWithProviders;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
    });
  };

  // Mission update mutation with cache invalidation
  const updateMissionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Mission> }) => {
      console.log('Updating mission:', id, updates);
      
      const { data, error } = await supabase
        .from('missions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating mission:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', data.id] });
      showSuccess('Sucesso', 'Missão atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Mission update error:', error);
      showError('Erro', 'Erro ao atualizar missão');
    }
  });

  const calculateMissionProgress = (mission: Mission): MissionProgress => {
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

    if (expenses <= budget) {
      const percentage = Math.min((expenses / budget) * 100, 100);
      return {
        percentage: Math.round(percentage),
        completedExpenses: expenses,
        totalBudget: budget,
        description: `${Math.round(percentage)}% do orçamento utilizado`
      };
    }

    return {
      percentage: 100,
      completedExpenses: expenses,
      totalBudget: budget,
      description: `Orçamento excedido em R$ ${(expenses - budget).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    };
  };

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription for missions');
    
    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions'
        },
        (payload) => {
          console.log('Real-time mission change:', payload);
          // Invalidate queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['missions'] });
          // Type assertion for payload.new to access id property safely
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['mission', (payload.new as any).id] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    useMissionQuery,
    useAllMissionsQuery,
    updateMissionMutation,
    calculateMissionProgress,
    // Legacy functions for backward compatibility
    fetchMissionWithProvider: fetchMissionWithProviderOptimized,
    fetchAllMissions: async () => {
      const result = await useAllMissionsQuery().refetch();
      return result.data || [];
    },
    updateMissionInList: (updatedMission: Mission) => {
      queryClient.setQueryData(['missions'], (oldData: MissionWithProvider[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(mission => 
          mission.id === updatedMission.id 
            ? { ...mission, ...updatedMission }
            : mission
        );
      });
    }
  };
};
