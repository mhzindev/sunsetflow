
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Download, FileText, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useFinancial } from '@/contexts/FinancialContext';

export const Reports = () => {
  const { data } = useFinancial();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados para gráficos
  const monthlyData = [
    { month: 'Jan', receitas: 45000, despesas: 32000, saldo: 13000 },
    { month: 'Fev', receitas: 52000, despesas: 38000, saldo: 14000 },
    { month: 'Mar', receitas: 48000, despesas: 35000, saldo: 13000 },
    { month: 'Abr', receitas: 58000, despesas: 42000, saldo: 16000 },
    { month: 'Mai', receitas: 61000, despesas: 45000, saldo: 16000 },
    { month: 'Jun', receitas: 67000, despesas: 48000, saldo: 19000 }
  ];

  const expensesByCategory = [
    { name: 'Pagamentos', value: 45000, color: '#8b5cf6' },
    { name: 'Despesas Operacionais', value: 25000, color: '#06b6d4' },
    { name: 'Viagens', value: 15000, color: '#10b981' },
    { name: 'Reembolsos', value: 8000, color: '#f59e0b' }
  ];

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "#10b981",
    },
    despesas: {
      label: "Despesas", 
      color: "#ef4444",
    },
    saldo: {
      label: "Saldo",
      color: "#3b82f6",
    }
  };

  const handleGenerateReport = (type: string) => {
    // Implementação da geração de relatórios
    console.log(`Gerando relatório: ${type}`, { dateRange });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Relatórios</h2>
            <p className="text-gray-600 mt-1">Análise completa do desempenho financeiro</p>
          </div>
        </div>

        {/* Filtros de Data */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <CalendarDays className="w-5 h-5 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Selecione o período para análise dos dados financeiros</p>
              </TooltipContent>
            </Tooltip>
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

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Receitas Totais</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.monthlyIncome)}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center cursor-help">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total de receitas recebidas no período selecionado</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.monthlyExpenses)}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center cursor-help">
                    <BarChart3 className="h-6 w-6 text-red-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total de despesas e pagamentos realizados no período</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.totalBalance)}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center cursor-help">
                    <PieChart className="h-6 w-6 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Saldo disponível em caixa atualmente</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pendências</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(data.pendingPayments)}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center cursor-help">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valor total de pagamentos e despesas pendentes</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Receitas e Despesas */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Receitas vs Despesas</h4>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receitas" fill="var(--color-receitas)" />
                  <Bar dataKey="despesas" fill="var(--color-despesas)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          {/* Gráfico de Distribuição de Despesas */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Distribuição de Despesas</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsPieChart data={expensesByCategory} cx="50%" cy="50%" outerRadius={80}>
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Evolução do Saldo */}
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Evolução do Saldo</h4>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="var(--color-saldo)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-saldo)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Botões de Export */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-800">Exportar Relatórios</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Download className="w-5 h-5 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Gere relatórios em PDF para impressão ou arquivo</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => handleGenerateReport('financial')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Relatório Financeiro
            </Button>
            <Button 
              onClick={() => handleGenerateReport('cashflow')}
              className="bg-green-600 hover:bg-green-700"
            >
              Fluxo de Caixa
            </Button>
            <Button 
              onClick={() => handleGenerateReport('expenses')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Relatório de Despesas
            </Button>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};
