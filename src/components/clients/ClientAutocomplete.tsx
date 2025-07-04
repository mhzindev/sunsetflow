
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { Check, Plus } from 'lucide-react';

interface ClientAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onClientSelect?: (client: any) => void;
  placeholder?: string;
}

export const ClientAutocomplete = ({ 
  value, 
  onValueChange, 
  onClientSelect, 
  placeholder = "Digite o nome do cliente" 
}: ClientAutocompleteProps) => {
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCreateOption, setShowCreateOption] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const { fetchClients, insertClient } = useSupabaseData();
  const { showSuccess, showError } = useToastFeedback();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (value && value.trim().length > 0) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClients(filtered);
      
      // Verifica se o valor digitado é exatamente igual a algum cliente existente
      const exactMatch = clients.find(client => 
        client.name.toLowerCase() === value.toLowerCase()
      );
      setShowCreateOption(!exactMatch && value.trim().length > 2);
      
      if (inputFocused) {
        setShowSuggestions(true);
      }
    } else {
      setFilteredClients([]);
      setShowSuggestions(false);
      setShowCreateOption(false);
    }
  }, [value, clients, inputFocused]);

  const loadClients = async () => {
    try {
      const data = await fetchClients();
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showError('Erro', 'Não foi possível carregar os clientes');
    }
  };

  const handleClientSelect = (client: any) => {
    onValueChange(client.name);
    setShowSuggestions(false);
    setInputFocused(false);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleCreateClient = async () => {
    if (!value.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await insertClient({
        name: value.trim()
      });

      if (error) {
        showError('Erro', `Erro ao criar cliente: ${error}`);
        return;
      }

      showSuccess('Sucesso', 'Cliente criado com sucesso!');
      await loadClients();
      setShowSuggestions(false);
      setShowCreateOption(false);
      setInputFocused(false);
      
      if (onClientSelect && data) {
        onClientSelect(data);
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      showError('Erro', 'Erro ao criar cliente');
    } finally {
      setCreating(false);
    }
  };

  const handleInputFocus = () => {
    setInputFocused(true);
    if (value && (filteredClients.length > 0 || showCreateOption)) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setInputFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
      />
      
      {showSuggestions && (filteredClients.length > 0 || showCreateOption) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
            >
              <Check className="w-4 h-4 mr-2 text-green-600" />
              <div>
                <span className="font-medium">{client.name}</span>
                {client.company_name && (
                  <span className="text-sm text-gray-500 ml-2">({client.company_name})</span>
                )}
              </div>
            </button>
          ))}
          
          {showCreateOption && (
            <button
              onClick={handleCreateClient}
              disabled={creating}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center border-t border-gray-100"
            >
              <Plus className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-blue-600">
                {creating ? 'Criando...' : `Criar cliente "${value}"`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
