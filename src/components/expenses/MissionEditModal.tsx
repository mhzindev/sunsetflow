import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { ServiceProviderSelector } from '@/components/missions/ServiceProviderSelector';
import { MissionStatusSelector } from '@/components/missions/MissionStatusSelector';
import { ServiceValueDistribution } from '@/components/missions/ServiceValueDistribution';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/authUtils';
import { useMissionData } from '@/hooks/useMissionData';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Mission } from '@/types/mission';
import { validateInput, sanitizeInput } from '@/utils/securityValidation';

interface MissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
  onSave: (mission: Mission) => void;
}

export const MissionEditModal = ({ isOpen, onClose, mission, onSave }: MissionEditModalProps) => {
  const { showSuccess, showError } = useToastFeedback();
  const { profile } = useAuth();
  const { updateMissionMutation } = useMissionData();
  const { validatePermission } = useSecureAuth();
  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    assigned_providers: [] as string[],
    description: '',
    service_value: 0,
    company_percentage: 30,
    provider_percentage: 70,
    company_value: 0,
    provider_value: 0,
    is_approved: false
  });

  const canEditValues = isAdmin(profile);
  const canApprove = isAdmin(profile);

  useEffect(() => {
    if (mission) {
      setFormData({
        title: mission.title,
        client_name: mission.client_name,
        location: mission.location,
        start_date: mission.start_date,
        end_date: mission.end_date || '',
        status: mission.status,
        assigned_providers: Array.isArray(mission.assigned_providers) ? mission.assigned_providers : [],
        description: mission.description || '',
        service_value: mission.service_value || 0,
        company_percentage: mission.company_percentage || 30,
        provider_percentage: mission.provider_percentage || 70,
        company_value: mission.company_value || 0,
        provider_value: mission.provider_value || 0,
        is_approved: mission.is_approved || false
      });
    }
  }, [mission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security validation
    if (!validatePermission()) {
      return;
    }

    // Input validation
    if (!validateInput(formData.title) || !validateInput(formData.client_name) || !validateInput(formData.location)) {
      showError('Erro de Validação', 'Preencha todos os campos obrigatórios com dados válidos');
      return;
    }

    if (!formData.start_date) {
      showError('Erro de Validação', 'Data de início é obrigatória');
      return;
    }

    if (!mission?.id) {
      showError('Erro', 'ID da missão não encontrado');
      return;
    }

    try {
      // Sanitize inputs
      const sanitizedData = {
        title: sanitizeInput(formData.title),
        client_name: sanitizeInput(formData.client_name),
        location: sanitizeInput(formData.location),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: formData.status,
        assigned_providers: formData.assigned_providers,
        description: sanitizeInput(formData.description),
        service_value: formData.service_value,
        company_percentage: formData.company_percentage,
        provider_percentage: formData.provider_percentage,
        company_value: formData.company_value,
        provider_value: formData.provider_value,
        is_approved: formData.is_approved
      };

      // Use the optimized mutation
      await updateMissionMutation.mutateAsync({
        id: mission.id,
        updates: sanitizedData
      });

      // Create updated mission object for callback
      const updatedMission: Mission = {
        ...mission,
        ...sanitizedData
      };

      // Call callback to update parent component
      onSave(updatedMission);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar missão');
      // Error is already handled by the mutation
    }
  };

  const handleServiceValueChange = (value: number) => {
    setFormData(prev => ({ ...prev, service_value: value }));
  };

  const handleCompanyPercentageChange = (percentage: number) => {
    setFormData(prev => ({ 
      ...prev, 
      company_percentage: percentage,
      provider_percentage: 100 - percentage
    }));
  };

  const handleApprove = () => {
    if (formData.service_value <= 0) {
      showError('Erro', 'Defina um valor para o serviço antes de aprovar');
      return;
    }

    setFormData(prev => ({ ...prev, is_approved: true }));
    showSuccess('Sucesso', 'Missão aprovada!');
  };

  if (!mission) return null;

  const isLoading = updateMissionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Missão</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título da Missão *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_name">Cliente *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Local *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          </div>

          <MissionStatusSelector
            value={formData.status}
            onValueChange={(value) => setFormData({...formData, status: value})}
            disabled={!canEditValues}
            showFinancialImpact={canEditValues}
          />

          <ServiceProviderSelector
            selectedProviders={formData.assigned_providers}
            onProvidersChange={(providers) => setFormData({...formData, assigned_providers: providers})}
            disabled={formData.is_approved && !canEditValues}
          />

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição detalhada da missão..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          {canEditValues && (
            <ServiceValueDistribution
              serviceValue={formData.service_value}
              companyPercentage={formData.company_percentage}
              onServiceValueChange={handleServiceValueChange}
              onCompanyPercentageChange={handleCompanyPercentageChange}
              isApproved={formData.is_approved}
              canApprove={canApprove}
              onApprove={handleApprove}
              readOnly={formData.is_approved}
            />
          )}

          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
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
