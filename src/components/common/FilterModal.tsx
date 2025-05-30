
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FilterConfig {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  status?: string[];
  amountRange?: {
    min: number | null;
    max: number | null;
  };
  category?: string[];
  provider?: string[];
  search?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  availableStatuses: { value: string; label: string }[];
  availableCategories?: { value: string; label: string }[];
  availableProviders?: { value: string; label: string }[];
  title: string;
}

export const FilterModal = ({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  availableStatuses,
  availableCategories,
  availableProviders,
  title
}: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState<FilterConfig>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterConfig = {
      dateRange: { start: null, end: null },
      status: [],
      amountRange: { min: null, max: null },
      category: [],
      provider: [],
      search: ''
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const removeStatus = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status?.filter(s => s !== status) || []
    }));
  };

  const removeCategory = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      category: prev.category?.filter(c => c !== category) || []
    }));
  };

  const removeProvider = (provider: string) => {
    setLocalFilters(prev => ({
      ...prev,
      provider: prev.provider?.filter(p => p !== provider) || []
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Busca por texto */}
          <div className="space-y-2">
            <Label>Busca por texto</Label>
            <Input
              placeholder="Digite para buscar..."
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateRange?.start ? 
                      format(localFilters.dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : 
                      'Data inicial'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange?.start || undefined}
                    onSelect={(date) => setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: date || null }
                    }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateRange?.end ? 
                      format(localFilters.dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : 
                      'Data final'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange?.end || undefined}
                    onSelect={(date) => setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: date || null }
                    }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select onValueChange={(value) => {
              if (!localFilters.status?.includes(value)) {
                setLocalFilters(prev => ({
                  ...prev,
                  status: [...(prev.status || []), value]
                }));
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {localFilters.status?.map(status => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  {availableStatuses.find(s => s.value === status)?.label}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeStatus(status)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Categorias */}
          {availableCategories && (
            <div className="space-y-2">
              <Label>Categorias</Label>
              <Select onValueChange={(value) => {
                if (!localFilters.category?.includes(value)) {
                  setLocalFilters(prev => ({
                    ...prev,
                    category: [...(prev.category || []), value]
                  }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione categorias" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {localFilters.category?.map(category => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {availableCategories.find(c => c.value === category)?.label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeCategory(category)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prestadores */}
          {availableProviders && (
            <div className="space-y-2">
              <Label>Prestadores</Label>
              <Select onValueChange={(value) => {
                if (!localFilters.provider?.includes(value)) {
                  setLocalFilters(prev => ({
                    ...prev,
                    provider: [...(prev.provider || []), value]
                  }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione prestadores" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map(provider => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {localFilters.provider?.map(provider => (
                  <Badge key={provider} variant="secondary" className="flex items-center gap-1">
                    {availableProviders.find(p => p.value === provider)?.label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeProvider(provider)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Faixa de valores */}
          <div className="space-y-2">
            <Label>Valor</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Valor mínimo"
                value={localFilters.amountRange?.min || ''}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  amountRange: {
                    ...prev.amountRange,
                    min: e.target.value ? parseFloat(e.target.value) : null
                  }
                }))}
              />
              <Input
                type="number"
                placeholder="Valor máximo"
                value={localFilters.amountRange?.max || ''}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  amountRange: {
                    ...prev.amountRange,
                    max: e.target.value ? parseFloat(e.target.value) : null
                  }
                }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
