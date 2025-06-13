
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Shield } from "lucide-react";
import { useSupabaseDataSecure } from "@/hooks/useSupabaseDataSecure";
import { useMemo } from "react";

export const CashFlowChartSecure = () => {
  const { transactions } = useSupabaseDataSecure();

  // Calcular dados dos últimos 6 meses
  const chartData = useMemo(() => {
    const currentDate = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Filtrar transações do mês
      const monthTransactions = transactions?.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === monthDate.getFullYear() &&
               transactionDate.getMonth() === monthDate.getMonth();
      }) || [];
      
      const income = monthTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({
        month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }),
        fullMonth: monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }
    
    return months;
  }, [transactions]);

  const maxValue = Math.max(...chartData.map(month => Math.max(month.income, month.expenses)));
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const totals = chartData.reduce((acc, month) => ({
    totalIncome: acc.totalIncome + month.income,
    totalExpenses: acc.totalExpenses + month.expenses
  }), { totalIncome: 0, totalExpenses: 0 });

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border-0 shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              Fluxo de Caixa Seguro
              <Shield className="h-5 w-5 text-green-600" />
            </h3>
            <p className="text-sm text-slate-600">Últimos 6 meses - Dados isolados por empresa</p>
          </div>
          
          {/* Resumo */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-emerald-800 font-medium">Receitas</p>
                <p className="text-emerald-600 text-xs">{formatCurrency(totals.totalIncome)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Despesas</p>
                <p className="text-red-600 text-xs">{formatCurrency(totals.totalExpenses)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-blue-800 font-medium">Saldo</p>
                <p className={`text-xs font-medium ${
                  totals.totalIncome - totals.totalExpenses >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(totals.totalIncome - totals.totalExpenses)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Moderno */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-t from-slate-100/50 to-transparent rounded-xl p-4 flex items-end justify-around gap-2 overflow-x-auto">
            {chartData.map((month, index) => {
              const incomeHeight = maxValue > 0 ? (month.income / maxValue) * 200 : 0;
              const expenseHeight = maxValue > 0 ? (month.expenses / maxValue) * 200 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-3 min-w-[60px] group">
                  {/* Barras */}
                  <div className="flex items-end space-x-1 relative">
                    {/* Barra de Receitas */}
                    <div className="relative">
                      <div 
                        className="w-6 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg shadow-lg transition-all duration-300 group-hover:from-emerald-600 group-hover:to-emerald-500 group-hover:shadow-emerald-200"
                        style={{ height: `${incomeHeight}px` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatCurrency(month.income)}
                      </div>
                    </div>
                    
                    {/* Barra de Despesas */}
                    <div className="relative">
                      <div 
                        className="w-6 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg shadow-lg transition-all duration-300 group-hover:from-red-600 group-hover:to-red-500 group-hover:shadow-red-200"
                        style={{ height: `${expenseHeight}px` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {formatCurrency(month.expenses)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rótulo do Mês */}
                  <div className="text-center">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {month.month}
                    </span>
                    {/* Saldo líquido */}
                    <div className={`text-xs font-semibold mt-1 ${
                      month.net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {month.net >= 0 ? '+' : ''}{formatCurrency(month.net)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded"></div>
            <span className="text-sm text-slate-600 font-medium">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-400 rounded"></div>
            <span className="text-sm text-slate-600 font-medium">Despesas</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
