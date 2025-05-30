
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar as CalendarIcon, FileText, Table, File } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExportOptions } from '@/utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
  title: string;
  totalRecords: number;
}

export const ExportModal = ({
  isOpen,
  onOpenChange,
  onExport,
  title,
  totalRecords
}: ExportModalProps) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeHeaders: true,
    filename: `export_${new Date().toISOString().split('T')[0]}`
  });

  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null
  });

  const handleExport = () => {
    const exportOptions: ExportOptions = {
      ...options,
      dateRange: dateRange.start && dateRange.end ? {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      } : undefined
    };
    
    onExport(exportOptions);
    onOpenChange(false);
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: Table },
    { value: 'excel', label: 'Excel', icon: File },
    { value: 'pdf', label: 'PDF', icon: FileText }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {totalRecords} registro(s) serão exportados
          </div>

          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato de exportação</Label>
            <Select value={options.format} onValueChange={(value: 'csv' | 'excel' | 'pdf') => 
              setOptions(prev => ({ ...prev, format: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map(format => {
                  const Icon = format.icon;
                  return (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {format.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Nome do arquivo */}
          <div className="space-y-2">
            <Label>Nome do arquivo</Label>
            <Input
              value={options.filename}
              onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
              placeholder="Nome do arquivo"
            />
          </div>

          {/* Período específico */}
          <div className="space-y-2">
            <Label>Período específico (opcional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start ? 
                      format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : 
                      'Início'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.start || undefined}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, start: date || null }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.end ? 
                      format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : 
                      'Fim'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.end || undefined}
                    onSelect={(date) => setDateRange(prev => ({ ...prev, end: date || null }))}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Opções adicionais */}
          <div className="space-y-2">
            <Label>Opções</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHeaders"
                checked={options.includeHeaders}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, includeHeaders: checked as boolean }))
                }
              />
              <Label htmlFor="includeHeaders" className="text-sm">
                Incluir cabeçalhos
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
