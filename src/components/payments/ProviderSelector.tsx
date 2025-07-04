
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { RefreshCw } from 'lucide-react';

interface ProviderSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onProviderSelect?: (provider: any) => void;
  selectedProvider?: string;
  placeholder?: string;
}

export const ProviderSelector = ({ 
  value, 
  onValueChange, 
  onProviderSelect, 
  selectedProvider,
  placeholder = "Selecionar prestador" 
}: ProviderSelectorProps) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchServiceProviders } = useSupabaseData();

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
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (providerId: string) => {
    if (onValueChange) {
      onValueChange(providerId);
    }
    const selectedProvider = providers.find(p => p.id === providerId);
    if (selectedProvider && onProviderSelect) {
      onProviderSelect(selectedProvider);
    }
  };

  const currentValue = value || (selectedProvider ? providers.find(p => p.name === selectedProvider)?.id : undefined);

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Carregando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="_loading" disabled>
            <div className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Carregando prestadores...
            </div>
          </SelectItem>
        ) : providers.length === 0 ? (
          <SelectItem value="_empty" disabled>
            Nenhum prestador encontrado
          </SelectItem>
        ) : (
          providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex flex-col">
                <span className="font-medium">{provider.name}</span>
                <span className="text-sm text-gray-500">{provider.service}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
