
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard, Receipt, AlertTriangle } from "lucide-react";
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
      color: "bg-blue-600"
    },
    {
      title: "Receitas (30 dias)",
      value: formatCurrency(data.monthlyIncome),
      change: getPercentageChange(data.monthlyIncome, previousMonthIncome),
      changeType: data.monthlyIncome > previousMonthIncome ? "positive" : "negative",
      icon: TrendingUp,
      color: "bg-emerald-600"
    },
    {
      title: "Despesas (30 dias)",
      value: formatCurrency(data.monthlyExpenses),
      change: getPercentageChange(data.monthlyExpenses, previousMonthExpenses),
      changeType: data.monthlyExpenses < previousMonthExpenses ? "positive" : "negative",
      icon: TrendingDown,
      color: "bg-red-600"
    },
    {
      title: "Pagamentos Pendentes",
      value: formatCurrency(data.pendingPayments),
      change: `${data.payments.filter(p => p.status === 'pending').length} pendentes`,
      changeType: "neutral",
      icon: CreditCard,
      color: "bg-purple-600"
    },
    {
      title: "Despesas Pendentes",
      value: formatCurrency(data.pendingExpenses),
      change: `${data.expenses.filter(e => e.status === 'pending').length} aguardando`,
      changeType: data.pendingExpenses > 0 ? "warning" : "positive",
      icon: Receipt,
      color: "bg-orange-600"
    },
    {
      title: "Despesas Aprovadas",
      value: formatCurrency(data.approvedExpenses),
      change: `${data.expenses.filter(e => e.status === 'approved').length} para reembolso`,
      changeType: data.approvedExpenses > 0 ? "warning" : "positive",
      icon: AlertTriangle,
      color: "bg-yellow-600"
    }
  ];

  return (
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
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
