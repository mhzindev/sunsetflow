
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Check, X, Users } from 'lucide-react';

interface ServiceProviderSelectorProps {
  selectedProviders: string[];
  onProvidersChange: (providers: string[]) => void;
  label?: string;
  disabled?: boolean;
}

export const ServiceProviderSelector = ({
  selectedProviders,
  onProvidersChange,
  label = "Prestadores de Serviço",
  disabled = false
}: ServiceProviderSelectorProps) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchServiceProviders } = useSupabaseData();
  const { showError } = useToastFeedback();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceProviders();
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar prestadores:', error);
      showError('Erro', 'Não foi possível carregar os prestadores');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderToggle = (providerId: string) => {
    if (disabled) return;
    
    const isSelected = selectedProviders.includes(providerId);
    
    if (isSelected) {
      onProvidersChange(selectedProviders.filter(id => id !== providerId));
    } else {
      onProvidersChange([...selectedProviders, providerId]);
    }
  };

  const clearAllProviders = () => {
    if (disabled) return;
    onProvidersChange([]);
  };

  const getSelectedProviderNames = () => {
    return providers
      .filter(provider => selectedProviders.includes(provider.id))
      .map(provider => provider.name);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="text-sm text-gray-500">Carregando prestadores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {selectedProviders.length > 0 && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAllProviders}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {providers.length === 0 ? (
        <div className="text-sm text-gray-500 p-4 text-center border border-dashed border-gray-300 rounded-lg">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          Nenhum prestador cadastrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {providers.map((provider) => {
            const isSelected = selectedProviders.includes(provider.id);
            return (
              <label
                key={provider.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  disabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'hover:bg-gray-50'
                } ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleProviderToggle(provider.id)}
                  disabled={disabled}
                  className="rounded text-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    <span className="font-medium text-sm truncate">
                      {provider.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {provider.service}
                  </div>
                  {provider.hourly_rate && (
                    <div className="text-xs text-green-600">
                      R$ {Number(provider.hourly_rate).toFixed(2)}/hora
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selectedProviders.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Prestadores Selecionados ({selectedProviders.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedProviderNames().map((name, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
