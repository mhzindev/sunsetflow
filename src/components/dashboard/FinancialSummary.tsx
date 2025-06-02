
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, RefreshCw } from "lucide-react";
import { useFinancialDashboard } from "@/hooks/useFinancialDashboard";

export const FinancialSummary = () => {
  const { data, loading, error, refetch } = useFinancialDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados financeiros: {error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  const cards = [
    {
      title: "Receitas (30 dias)",
      value: data.monthlyIncome,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: calculatePercentage(data.monthlyIncome, 1100) // Simulando valor anterior
    },
    {
      title: "Despesas (30 dias)", 
      value: data.monthlyExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: calculatePercentage(data.monthlyExpenses, 133) // Simulando valor anterior
    },
    {
      title: "Saldo em Contas",
      value: data.bankBalance,
      icon: Wallet,
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      change: 0
    },
    {
      title: "Crédito Disponível",
      value: data.creditAvailable,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50", 
      change: 0
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : (
                    formatCurrency(card.value)
                  )}
                </div>
                {!loading && card.change !== 0 && (
                  <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {isPositive ? '+' : ''}{card.change.toFixed(1)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
