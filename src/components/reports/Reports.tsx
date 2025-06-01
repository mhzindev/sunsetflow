import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useReportGenerator } from "@/hooks/useReportGenerator";
import { useFinancial } from "@/contexts/FinancialContext";
import { useAlerts, AlertConfig } from "@/hooks/useAlerts";
import { AlertConfigModal } from "@/components/alerts/AlertConfigModal";
import { AlertsList } from "@/components/alerts/AlertsList";
import { ActiveAlertsList } from "@/components/alerts/ActiveAlertsList";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  });
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState<AlertConfig['type']>('payment');
  const [editingAlert, setEditingAlert] = useState<AlertConfig | undefined>();

  const { generateReport } = useReportGenerator();
  const { data } = useFinancial();
  const { activeAlerts, createAlert, updateAlert } = useAlerts();

  // Calcular dados reais do sistema
  const financialSummary = {
    totalRevenue: data.monthlyIncome,
    totalExpenses: data.monthlyExpenses,
    netProfit: data.monthlyIncome - data.monthlyExpenses,
    profitMargin: data.monthlyIncome > 0 ? ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome * 100) : 0,
    transactions: data.transactions.length,
    averageTicket: data.transactions.length > 0 ? data.monthlyIncome / data.transactions.filter(t => t.type === 'income').length : 0
  };

  const paymentsSummary = {
    totalPaid: data.payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalPending: data.payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalOverdue: data.payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
    onTimePayments: data.payments.filter(p => p.status === 'completed').length,
    latePayments: data.payments.filter(p => p.status === 'overdue').length,
    cancelledPayments: data.payments.filter(p => p.status === 'cancelled').length
  };

  const employeeExpenses = data.transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => {
      if (!acc[t.userName]) {
        acc[t.userName] = { name: t.userName, total: 0, trips: 0, category: 'Técnico' };
      }
      acc[t.userName].total += t.amount;
      acc[t.userName].trips += 1;
      return acc;
    }, {} as any);

  const employeeExpensesArray = Object.values(employeeExpenses).slice(0, 4);

  const handleGenerateReport = async (type: string) => {
    setIsGenerating(type);
    await generateReport(type, dateRange);
    setIsGenerating(null);
  };

  const handleCreateAlert = (type: AlertConfig['type']) => {
    setSelectedAlertType(type);
    setEditingAlert(undefined);
    setAlertModalOpen(true);
  };

  const handleEditAlert = (alert: AlertConfig) => {
    setEditingAlert(alert);
    setSelectedAlertType(alert.type);
    setAlertModalOpen(true);
  };

  const handleSaveAlert = (config: Omit<AlertConfig, 'id' | 'createdAt'>) => {
    if (editingAlert) {
      updateAlert(editingAlert.id, config);
    } else {
      createAlert(config);
    }
  };

  // Alertas dinâmicos baseados nos dados atuais
  const dynamicAlerts = [
    {
      type: 'warning' as const,
      title: 'Pagamentos em Atraso',
      description: `${paymentsSummary.latePayments} pagamentos estão atrasados totalizando R$ ${paymentsSummary.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      priority: 'high' as const
    },
    {
      type: 'info' as const,
      title: 'Meta de Receita',
      description: `Receita atual: R$ ${financialSummary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      priority: 'medium' as const
    },
    {
      type: 'success' as const,
      title: 'Controle de Despesas',
      description: `Total de despesas: R$ ${financialSummary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      priority: 'low' as const
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Relatórios e Alertas</h3>
          <p className="text-slate-600 mb-6">
            Gere relatórios financeiros detalhados e configure alertas automáticos 
            para melhor controle da saúde financeira da empresa.
          </p>

          {/* Seletor de Período */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Calendar className="w-4 h-4 mr-2" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selecionar período de tempo</p>
                  </TooltipContent>
                </Tooltip>
                Período Selecionado
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="expenses">Despesas</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="mt-6">
              <div className="space-y-6">
                {/* Resumo Financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Receita total do período</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h4 className="font-semibold text-green-700">Receita Total</h4>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {financialSummary.totalRevenue.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">{financialSummary.transactions} transações</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DollarSign className="w-5 h-5 text-red-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total de despesas do período</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h4 className="font-semibold text-red-700">Despesas Total</h4>
                        <p className="text-2xl font-bold text-red-600">
                          R$ {financialSummary.totalExpenses.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">Ticket médio: R$ {financialSummary.averageTicket.toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lucro líquido calculado</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h4 className="font-semibold text-blue-700">Lucro Líquido</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {financialSummary.netProfit.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">Margem: {financialSummary.profitMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Botões de Relatório */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => handleGenerateReport('financial')} 
                    className="h-16"
                    disabled={isGenerating === 'financial'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FileText className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gerar DRE e Balanço Patrimonial</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'financial' ? 'Gerando...' : 'Relatório Financeiro'}
                      </p>
                      <p className="text-xs opacity-80">DRE e Balanço</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleGenerateReport('cashflow')} 
                    variant="outline" 
                    className="h-16"
                    disabled={isGenerating === 'cashflow'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TrendingUp className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Análise de fluxo de caixa</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'cashflow' ? 'Gerando...' : 'Fluxo de Caixa'}
                      </p>
                      <p className="text-xs opacity-80">Entradas e Saídas</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleGenerateReport('taxes')} 
                    variant="outline" 
                    className="h-16"
                    disabled={isGenerating === 'taxes'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Download className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Relatório para contabilidade</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'taxes' ? 'Gerando...' : 'Relatório Fiscal'}
                      </p>
                      <p className="text-xs opacity-80">Para Contabilidade</p>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <div className="space-y-6">
                {/* Resumo de Pagamentos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-green-200">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pagamentos concluídos</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h4 className="font-semibold text-green-700">Pagos</h4>
                        <p className="text-xl font-bold text-green-600">
                          R$ {paymentsSummary.totalPaid.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">{paymentsSummary.onTimePayments} pagamentos</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pagamentos aguardando vencimento</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h4 className="font-semibold text-yellow-700">Pendentes</h4>
                        <p className="text-xl font-bold text-yellow-600">
                          R$ {paymentsSummary.totalPending.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">A vencer</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 border-red-200">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pagamentos vencidos</p>
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <h4 className="font-semibold text-red-700">Em Atraso</h4>
                        <p className="text-xl font-bold text-red-600">
                          R$ {paymentsSummary.totalOverdue.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-500">{paymentsSummary.latePayments} pagamentos</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Botões de Relatório de Pagamentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleGenerateReport('payments')} 
                    className="h-16"
                    disabled={isGenerating === 'payments'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FileText className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Histórico completo de pagamentos</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'payments' ? 'Gerando...' : 'Relatório de Pagamentos'}
                      </p>
                      <p className="text-xs opacity-80">Histórico completo</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleGenerateReport('providers')} 
                    variant="outline" 
                    className="h-16"
                    disabled={isGenerating === 'providers'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Users className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Análise por prestador de serviços</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'providers' ? 'Gerando...' : 'Relatório por Prestador'}
                      </p>
                      <p className="text-xs opacity-80">Análise individual</p>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-6">
              <div className="space-y-6">
                {/* Despesas por Funcionário */}
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Funcionário</h4>
                  <div className="space-y-3">
                    {employeeExpensesArray.map((employee: any, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {employee.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{employee.name}</p>
                            <p className="text-sm text-slate-600">{employee.category} • {employee.trips} transações</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">
                            R$ {employee.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-slate-600">
                            Média: R$ {(employee.total / employee.trips).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Botões de Relatório de Despesas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleGenerateReport('travel-expenses')} 
                    className="h-16"
                    disabled={isGenerating === 'travel-expenses'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FileText className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Relatório de despesas por funcionário e missão</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'travel-expenses' ? 'Gerando...' : 'Relatório de Despesas'}
                      </p>
                      <p className="text-xs opacity-80">Por funcionário e missão</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleGenerateReport('reimbursements')} 
                    variant="outline" 
                    className="h-16"
                    disabled={isGenerating === 'reimbursements'}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DollarSign className="w-5 h-5 mr-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Relatório de reembolsos pendentes e aprovados</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-left">
                      <p className="font-semibold">
                        {isGenerating === 'reimbursements' ? 'Gerando...' : 'Relatório de Reembolsos'}
                      </p>
                      <p className="text-xs opacity-80">Pendentes e aprovados</p>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <div className="space-y-6">
                {/* Alertas Ativos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800">
                      Alertas Ativos {activeAlerts.filter(a => !a.acknowledged).length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {activeAlerts.filter(a => !a.acknowledged).length}
                        </Badge>
                      )}
                    </h4>
                  </div>
                  <ActiveAlertsList />
                </div>

                {/* Configuração de Alertas */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800">Configurar Novos Alertas</h4>
                    <Button onClick={() => handleCreateAlert('payment')} size="sm">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Plus className="w-4 h-4 mr-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adicionar novo alerta</p>
                        </TooltipContent>
                      </Tooltip>
                      Novo Alerta
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Button 
                      variant="outline" 
                      className="h-16 justify-start"
                      onClick={() => handleCreateAlert('payment')}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configurar alertas de pagamentos</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-left">
                        <p className="font-semibold">Alerta de Pagamento</p>
                        <p className="text-xs text-gray-500">Pagamentos em atraso e vencimentos</p>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 justify-start"
                      onClick={() => handleCreateAlert('goal')}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TrendingUp className="w-5 h-5 mr-3 text-blue-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configurar alertas de metas</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-left">
                        <p className="font-semibold">Alerta de Meta</p>
                        <p className="text-xs text-gray-500">Metas de receita e desempenho</p>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 justify-start"
                      onClick={() => handleCreateAlert('cashflow')}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DollarSign className="w-5 h-5 mr-3 text-green-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configurar alertas de fluxo de caixa</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-left">
                        <p className="font-semibold">Alerta de Fluxo de Caixa</p>
                        <p className="text-xs text-gray-500">Saldo mínimo e fluxo negativo</p>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-16 justify-start"
                      onClick={() => handleCreateAlert('expense')}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Users className="w-5 h-5 mr-3 text-orange-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configurar alertas de despesas</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-left">
                        <p className="font-semibold">Alerta de Despesas</p>
                        <p className="text-xs text-gray-500">Limites de gastos e orçamentos</p>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Lista de Alertas Configurados */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Alertas Configurados</h4>
                  <AlertsList onEditAlert={handleEditAlert} />
                </div>

                {/* Resumo dos Dados Atuais */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Situação Atual</h4>
                  <div className="space-y-3">
                    {dynamicAlerts.map((alert, index) => (
                      <Card key={index} className={`p-4 border-l-4 ${
                        alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                        alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {alert.type === 'warning' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Alerta de atenção</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {alert.type === 'success' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Status positivo</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {alert.type === 'info' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Informação de tendência</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-800">{alert.title}</h5>
                            <p className="text-slate-600 text-sm">{alert.description}</p>
                          </div>
                          
                          <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                            {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Modal de Configuração de Alerta */}
        <AlertConfigModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          onSave={handleSaveAlert}
          initialType={selectedAlertType}
          editingAlert={editingAlert}
        />
      </div>
    </TooltipProvider>
  );
};
