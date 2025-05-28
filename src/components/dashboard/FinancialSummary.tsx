import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

export const FinancialSummary = () => {
  const summaryCards = [
    {
      title: "Saldo Total",
      value: "R$ 45.720,00",
      change: "+12,5%",
      changeType: "positive",
      icon: Wallet,
      color: "bg-blue-600"
    },
    {
      title: "Receitas (30 dias)",
      value: "R$ 89.430,00",
      change: "+8,2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "bg-emerald-600"
    },
    {
      title: "Despesas (30 dias)",
      value: "R$ 43.710,00",
      change: "-3,1%",
      changeType: "negative",
      icon: TrendingDown,
      color: "bg-red-600"
    },
    {
      title: "Cartões de Crédito",
      value: "R$ 18.250,00",
      change: "4 cartões",
      changeType: "neutral",
      icon: CreditCard,
      color: "bg-purple-600"
    }
  ];

  return (
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
                  card.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
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
