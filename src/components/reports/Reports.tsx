import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, FileText, Download, Filter, Info, Clock, TrendingUp } from 'lucide-react';
import { useReportGenerator } from '@/hooks/useReportGenerator';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { formatCurrency, formatDate } from '@/utils/dateUtils';

export const Reports = () => {
  const [reportType, setReportType] = useState('financial');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodApplied, setPeriodApplied] = useState(false);
  const { generateReport, isGenerating } = useReportGenerator();
  const { showSuccess, showInfo } = useToastFeedback();
  const { data } = useFinancialSimplified();

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
      showInfo('Datas Obrigatórias', 'Selecione as datas de início e fim para gerar o relatório.');
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
    
    setPeriodApplied(true);
    showSuccess(
      'Período Aplicado',
      `Período selecionado: ${start} até ${end}. Agora você pode gerar relatórios filtrados por este período.`
    );
  };

  // Calcular estatísticas para o período selecionado
  const getperiodStats = () => {
    if (!startDate || !endDate || !data) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredTransactions = data.transactions?.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    }) || [];

    const filteredPayments = data.payments?.filter(p => {
      const paymentDate = new Date(p.dueDate);
      return paymentDate >= start && paymentDate <= end;
    }) || [];

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions: filteredTransactions.length,
      totalPayments: filteredPayments.length,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses
    };
  };

  const periodStats = getperiodStats();

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

        {/* Card de Período Aplicado - Restaurado */}
        {periodApplied && startDate && endDate && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Info className="w-5 h-5" />
                Período Aplicado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-blue-700">
                  Período selecionado: <strong>{new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}</strong>
                </p>
                <p className="text-sm text-blue-600">
                  Agora você pode gerar relatórios filtrados por este período.
                </p>
                
                {/* Estatísticas do Período */}
                {periodStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-blue-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-800">{periodStats.totalTransactions}</p>
                      <p className="text-xs text-blue-600">Transações</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(periodStats.totalIncome)}</p>
                      <p className="text-xs text-blue-600">Receitas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(periodStats.totalExpenses)}</p>
                      <p className="text-xs text-blue-600">Despesas</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${periodStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(periodStats.netBalance)}
                      </p>
                      <p className="text-xs text-blue-600">Saldo</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Status dos Dados - Restaurado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Status dos Dados
            </CardTitle>
            <CardDescription>
              Informações gerais sobre seus dados financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{data?.transactions?.length || 0}</p>
                <p className="text-sm text-slate-600">Total de Transações</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">{data?.payments?.length || 0}</p>
                <p className="text-sm text-slate-600">Total de Pagamentos</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-800">
                  {data?.transactions?.filter(t => t.type === 'income').length || 0}
                </p>
                <p className="text-sm text-slate-600">Receitas Registradas</p>
              </div>
            </div>
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
