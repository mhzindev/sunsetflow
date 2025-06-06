
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, FileText, Download, Filter } from 'lucide-react';
import { useReportGenerator } from '@/hooks/useReportGenerator';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const Reports = () => {
  const [reportType, setReportType] = useState('financial');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { generateReport, isGenerating } = useReportGenerator();
  const { showSuccess, showInfo } = useToastFeedback();

  const reportTypes = [
    { value: 'financial', label: 'Relatório Financeiro', description: 'Receitas, despesas e saldo geral' },
    { value: 'cashflow', label: 'Fluxo de Caixa', description: 'Entradas e saídas por período' },
    { value: 'taxes', label: 'Relatório Fiscal', description: 'Dados para declaração de impostos' },
    { value: 'payments', label: 'Relatório de Pagamentos', description: 'Pagamentos a prestadores' },
    { value: 'providers', label: 'Relatório de Prestadores', description: 'Análise por prestador de serviço' },
    { value: 'travel-expenses', label: 'Despesas de Viagem', description: 'Combustível e hospedagem' },
    { value: 'reimbursements', label: 'Reembolsos', description: 'Despesas reembolsáveis' }
  ];

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      return;
    }

    await generateReport(reportType, { start: startDate, end: endDate });
  };

  const handleSelectedPeriod = () => {
    if (!startDate || !endDate) {
      showInfo(
        'Período Selecionado',
        'Defina as datas de início e fim para filtrar os dados do relatório por período específico.'
      );
      return;
    }

    const start = new Date(startDate).toLocaleDateString('pt-BR');
    const end = new Date(endDate).toLocaleDateString('pt-BR');
    
    showSuccess(
      'Período Aplicado',
      `Período selecionado: ${start} até ${end}. Agora você pode gerar relatórios filtrados por este período.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios detalhados sobre suas finanças
          </p>
        </div>
        <FileText className="w-8 h-8 text-blue-600" />
      </div>

      <div className="grid gap-6">
        {/* Filtros de Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Período do Relatório
            </CardTitle>
            <CardDescription>
              Selecione o período para análise dos dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Data Inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Data Final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleSelectedPeriod}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Aplicar Período Selecionado
            </Button>
          </CardContent>
        </Card>

        {/* Tipos de Relatório */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
            <CardDescription>
              Escolha o tipo de relatório que deseja gerar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || !startDate || !endDate}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
