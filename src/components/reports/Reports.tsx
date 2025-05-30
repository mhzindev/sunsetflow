
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('financial');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  });

  // Mock data para relatórios
  const financialSummary = {
    totalRevenue: 45820.00,
    totalExpenses: 23150.00,
    netProfit: 22670.00,
    profitMargin: 49.5,
    transactions: 127,
    averageTicket: 360.79
  };

  const paymentsSummary = {
    totalPaid: 18500.00,
    totalPending: 8200.00,
    totalOverdue: 2800.00,
    onTimePayments: 89,
    latePayments: 12,
    cancelledPayments: 3
  };

  const employeeExpenses = [
    { name: 'João Santos', total: 2450.00, trips: 8, category: 'Técnico' },
    { name: 'Maria Oliveira', total: 1890.00, trips: 6, category: 'Técnica' },
    { name: 'Carlos Silva', total: 1650.00, trips: 5, category: 'Técnico' },
    { name: 'Ana Costa', total: 980.00, trips: 3, category: 'Suporte' }
  ];

  const alerts = [
    {
      type: 'warning',
      title: 'Pagamentos em Atraso',
      description: '3 pagamentos estão atrasados totalizando R$ 2.800,00',
      priority: 'high'
    },
    {
      type: 'info',
      title: 'Meta de Receita',
      description: 'Faltam R$ 4.180,00 para atingir a meta mensal',
      priority: 'medium'
    },
    {
      type: 'success',
      title: 'Despesas Controladas',
      description: 'Despesas 15% abaixo do orçamento planejado',
      priority: 'low'
    }
  ];

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report for period: ${dateRange.start} to ${dateRange.end}`);
    // Aqui seria a lógica para gerar e baixar o relatório
  };

  return (
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
              <Calendar className="w-4 h-4 mr-2" />
              Aplicar Filtro
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
                    <TrendingUp className="w-5 h-5 text-green-600" />
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
                    <DollarSign className="w-5 h-5 text-red-600" />
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
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-700">Lucro Líquido</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {financialSummary.netProfit.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500">Margem: {financialSummary.profitMargin}%</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Botões de Relatório */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => generateReport('financial')} className="h-16">
                  <FileText className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Relatório Financeiro</p>
                    <p className="text-xs opacity-80">DRE e Balanço</p>
                  </div>
                </Button>
                
                <Button onClick={() => generateReport('cashflow')} variant="outline" className="h-16">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Fluxo de Caixa</p>
                    <p className="text-xs opacity-80">Entradas e Saídas</p>
                  </div>
                </Button>
                
                <Button onClick={() => generateReport('taxes')} variant="outline" className="h-16">
                  <Download className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Relatório Fiscal</p>
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
                    <CheckCircle className="w-5 h-5 text-green-600" />
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
                    <Clock className="w-5 h-5 text-yellow-600" />
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
                    <AlertCircle className="w-5 h-5 text-red-600" />
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
                <Button onClick={() => generateReport('payments')} className="h-16">
                  <FileText className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Relatório de Pagamentos</p>
                    <p className="text-xs opacity-80">Histórico completo</p>
                  </div>
                </Button>
                
                <Button onClick={() => generateReport('providers')} variant="outline" className="h-16">
                  <Users className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Relatório por Prestador</p>
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
                  {employeeExpenses.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{employee.name}</p>
                          <p className="text-sm text-slate-600">{employee.category} • {employee.trips} viagens</p>
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
                <Button onClick={() => generateReport('travel-expenses')} className="h-16">
                  <FileText className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Relatório de Despesas</p>
                    <p className="text-xs opacity-80">Por funcionário e missão</p>
                  </div>
                </Button>
                
                <Button onClick={() => generateReport('reimbursements')} variant="outline" className="h-16">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <p className="font-semibold">Relatório de Reembolsos</p>
                    <p className="text-xs opacity-80">Pendentes e aprovados</p>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800">Alertas Automáticos</h4>
              
              {alerts.map((alert, index) => (
                <Card key={index} className={`p-4 border-l-4 ${
                  alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                  alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                    {alert.type === 'info' && <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />}
                    
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

              {/* Configuração de Alertas */}
              <Card className="p-6 mt-6">
                <h5 className="font-semibold text-slate-800 mb-4">Configurar Novos Alertas</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Alerta de Pagamento
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Alerta de Meta
                  </Button>
                  <Button variant="outline">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Alerta de Fluxo de Caixa
                  </Button>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Alerta de Despesas
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
