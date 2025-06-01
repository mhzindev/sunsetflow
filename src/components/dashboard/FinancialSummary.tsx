
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard, Receipt, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFinancial } from "@/contexts/FinancialContext";

export const FinancialSummary = () => {
  const { data } = useFinancial();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return '+0,0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Calcular mudanças simuladas (baseado em dados históricos fictícios)
  const previousMonthIncome = data.monthlyIncome > 0 ? data.monthlyIncome * 0.92 : 8500;
  const previousMonthExpenses = data.monthlyExpenses > 0 ? data.monthlyExpenses * 1.03 : 7200;
  const previousBalance = data.totalBalance * 0.89;

  const summaryCards = [
    {
      title: "Saldo Total",
      value: formatCurrency(data.totalBalance),
      change: getPercentageChange(data.totalBalance, previousBalance),
      changeType: data.totalBalance > previousBalance ? "positive" : "negative",
      icon: Wallet,
      color: "bg-blue-600",
      tooltip: "Representa o valor total disponível em caixa da empresa. Este valor é atualizado automaticamente com todas as transações, pagamentos e despesas do sistema. É o indicador principal da saúde financeira imediata da empresa."
    },
    {
      title: "Receitas (30 dias)",
      value: formatCurrency(data.monthlyIncome),
      change: getPercentageChange(data.monthlyIncome, previousMonthIncome),
      changeType: data.monthlyIncome > previousMonthIncome ? "positive" : "negative",
      icon: TrendingUp,
      color: "bg-emerald-600",
      tooltip: "Mostra todas as receitas recebidas nos últimos 30 dias, incluindo recebimentos via PIX, transferências e outras formas de pagamento. Essencial para acompanhar o desempenho de vendas e entrada de caixa."
    },
    {
      title: "Despesas (30 dias)",
      value: formatCurrency(data.monthlyExpenses),
      change: getPercentageChange(data.monthlyExpenses, previousMonthExpenses),
      changeType: data.monthlyExpenses < previousMonthExpenses ? "positive" : "negative",
      icon: TrendingDown,
      color: "bg-red-600",
      tooltip: "Apresenta o total de despesas dos últimos 30 dias, incluindo pagamentos a prestadores de serviços e despesas operacionais. Monitore este valor para controlar custos e manter a margem de lucro."
    },
    {
      title: "Pagamentos Pendentes",
      value: formatCurrency(data.pendingPayments),
      change: `${data.payments.filter(p => p.status === 'pending').length} pendentes`,
      changeType: "neutral",
      icon: CreditCard,
      color: "bg-purple-600",
      tooltip: "Exibe o valor total de pagamentos que ainda precisam ser efetuados a prestadores de serviços. Gerencie esta seção para evitar atrasos e manter bons relacionamentos com fornecedores."
    },
    {
      title: "Despesas Pendentes",
      value: formatCurrency(data.pendingExpenses),
      change: `${data.expenses.filter(e => e.status === 'pending').length} aguardando`,
      changeType: data.pendingExpenses > 0 ? "warning" : "positive",
      icon: Receipt,
      color: "bg-orange-600",
      tooltip: "Mostra despesas de viagem e operacionais submetidas pelos funcionários que ainda não foram aprovadas. Essas despesas foram pagas antecipadamente pela empresa e aguardam análise para classificação contábil."
    },
    {
      title: "Despesas Aprovadas",
      value: formatCurrency(data.approvedExpenses),
      change: `${data.expenses.filter(e => e.status === 'approved').length} para reembolso`,
      changeType: data.approvedExpenses > 0 ? "warning" : "positive",
      icon: AlertTriangle,
      color: "bg-yellow-600",
      tooltip: "Indica despesas já aprovadas que necessitam reembolso aos funcionários. Estas despesas foram pagas do próprio bolso pelos colaboradores e já foram validadas para pagamento."
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className={`text-sm mt-1 ${
                    card.changeType === 'positive' ? 'text-emerald-600' :
                    card.changeType === 'negative' ? 'text-red-600' : 
                    card.changeType === 'warning' ? 'text-orange-600' : 'text-slate-600'
                  }`}>
                    {card.change}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center cursor-help hover:opacity-80 transition-opacity`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{card.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
