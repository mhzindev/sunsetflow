
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download } from 'lucide-react';
import { PaymentStatus } from '@/types/payment';

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: PaymentStatus | 'all';
  onStatusChange: (status: PaymentStatus | 'all') => void;
  onFilterModalOpen: () => void;
  onExportModalOpen: () => void;
}

export const PaymentFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  onFilterModalOpen,
  onExportModalOpen
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por prestador ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as PaymentStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="partial">Parcial</option>
          <option value="overdue">Em Atraso</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
        
        <Button variant="outline" size="sm" onClick={onFilterModalOpen}>
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
        </Button>
        
        <Button variant="outline" size="sm" onClick={onExportModalOpen}>
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
