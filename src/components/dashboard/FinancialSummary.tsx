
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard, Receipt, AlertTriangle, Building2, Banknote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFinancialDashboard } from "@/hooks/useFinancialDashboard";

export const FinancialSummary = () => {
  const { data, loading, error } = useFinancialDashboard();

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
  const previousMonthIncome = data.monthlyIncome > 0 ? data.monthlyIncome * 0.92 : 1100;
  const previousMonthExpenses = data.monthlyExpenses > 0 ? data.monthlyExpenses * 1.03 : 133;
  const previousBalance = data.totalBalance * 0.89;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Erro ao carregar dados financeiros: {error}
        </div>
      </Card>
    );
  }

  const summaryCards = [
    {
      title: "Saldo em Contas",
      value: formatCurrency(data.bankBalance),
      change: `${data.bankBalance > 0 ? 'Positivo' : 'Negativo'}`,
      changeType: data.bankBalance > 0 ? "positive" : "negative",
      icon: Building2,
      color: "bg-blue-600",
      tooltip: "Valor total disponível em todas as contas bancárias ativas. Este saldo é atualizado automaticamente com as transações e reflete o dinheiro real disponível."
    },
    {
      title: "Limite Disponível",
      value: formatCurrency(data.creditAvailable),
      change: `Usado: ${formatCurrency(data.creditUsed)}`,
      changeType: "neutral",
      icon: CreditCard,
      color: "bg-purple-600",
      tooltip: "Limite disponível em todos os cartões de crédito ativos. Representa o valor que pode ser utilizado para compras e pagamentos."
    },
    {
      title: "Recursos Totais",
      value: formatCurrency(data.totalResources),
      change: `Dinheiro + Limite`,
      changeType: "positive",
      icon: Wallet,
      color: "bg-emerald-600",
      tooltip: "Soma do saldo em contas bancárias com o limite disponível nos cartões. Representa o total de recursos financeiros que a empresa pode utilizar."
    },
    {
      title: "Saldo Líquido",
      value: formatCurrency(data.totalBalance),
      change: getPercentageChange(data.totalBalance, previousBalance),
      changeType: data.totalBalance > previousBalance ? "positive" : "negative",
      icon: Banknote,
      color: data.totalBalance >= 0 ? "bg-green-600" : "bg-red-600",
      tooltip: "Saldo real da empresa considerando dinheiro em conta menos dívidas de cartão de crédito. É o patrimônio líquido disponível."
    },
    {
      title: "Receitas (30 dias)",
      value: formatCurrency(data.monthlyIncome),
      change: getPercentageChange(data.monthlyIncome, previousMonthIncome),
      changeType: data.monthlyIncome > previousMonthIncome ? "positive" : "negative",
      icon: TrendingUp,
      color: "bg-emerald-600",
      tooltip: "Todas as receitas recebidas nos últimos 30 dias, incluindo recebimentos via PIX, transferências e outras formas de pagamento."
    },
    {
      title: "Despesas (30 dias)",
      value: formatCurrency(data.monthlyExpenses),
      change: getPercentageChange(data.monthlyExpenses, previousMonthExpenses),
      changeType: data.monthlyExpenses < previousMonthExpenses ? "positive" : "negative",
      icon: TrendingDown,
      color: "bg-red-600",
      tooltip: "Total de despesas dos últimos 30 dias, incluindo pagamentos a prestadores de serviços e despesas operacionais."
    },
    {
      title: "Pagamentos Pendentes",
      value: formatCurrency(data.pendingPayments),
      change: `Pendentes`,
      changeType: "neutral",
      icon: CreditCard,
      color: "bg-orange-600",
      tooltip: "Valor total de pagamentos que ainda precisam ser efetuados a prestadores de serviços."
    },
    {
      title: "Despesas Aprovadas",
      value: formatCurrency(data.approvedExpenses),
      change: `Para reembolso`,
      changeType: data.approvedExpenses > 0 ? "warning" : "positive",
      icon: AlertTriangle,
      color: "bg-yellow-600",
      tooltip: "Despesas aprovadas que necessitam reembolso aos funcionários. Foram pagas do próprio bolso pelos colaboradores."
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
