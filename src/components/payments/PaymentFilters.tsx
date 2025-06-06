
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, ArrowUpDown } from 'lucide-react';
import { PaymentStatus } from '@/types/payment';

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: PaymentStatus | 'all';
  onStatusChange: (status: PaymentStatus | 'all') => void;
  sortOrder: 'alphabetical' | 'newest' | 'oldest';
  onSortOrderChange: (order: 'alphabetical' | 'newest' | 'oldest') => void;
  onFilterModalOpen: () => void;
  onExportModalOpen: () => void;
}

export const PaymentFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  sortOrder,
  onSortOrderChange,
  onFilterModalOpen,
  onExportModalOpen
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por prestador ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="overdue">Em Atraso</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alphabetical">
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Ordem Alfabética
              </div>
            </SelectItem>
            <SelectItem value="newest">
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Mais Recente
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Mais Antigo
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Button variant="outline" size="sm" onClick={onFilterModalOpen} className="flex-1 md:flex-none">
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
        </Button>
        <Button variant="outline" size="sm" onClick={onExportModalOpen} className="flex-1 md:flex-none">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
