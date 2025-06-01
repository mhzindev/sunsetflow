
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Download } from 'lucide-react';
import { ReportCards } from './ReportCards';

export const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios</h2>
          <p className="text-gray-600 mt-1">Gere relatórios detalhados do seu negócio</p>
        </div>
      </div>

      {/* Filtros de Data */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <CalendarDays className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-slate-800">Período dos Relatórios</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="start-date">Data Inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="end-date">Data Final</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
      </Card>

      {/* Cards de Relatórios */}
      <ReportCards onDateRangeChange={handleDateRangeChange} />

      {/* Instruções */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Download className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Como usar os relatórios</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Selecione o período desejado usando os campos de data acima</li>
              <li>• Clique no card do relatório que deseja gerar</li>
              <li>• O arquivo PDF será baixado automaticamente</li>
              <li>• Passe o mouse sobre os ícones para ver mais detalhes sobre cada relatório</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
