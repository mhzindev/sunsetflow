
import { Card } from "@/components/ui/card";
import { useExpensesDebug } from "@/hooks/useExpensesDebug";
import { Badge } from "@/components/ui/badge";

export const FinancialSummaryDebug = () => {
  const { transactionExpenses, tableExpenses, dashboardExpenses, loading, error } = useExpensesDebug();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p>🔍 Analisando dados de despesas...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          🔍 Debug: Análise de Despesas
        </h3>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">❌ Erro: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-800">📊 Dashboard (Transações)</h4>
            <p className="text-2xl font-bold text-blue-900">
              R$ {dashboardExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-blue-700">
              {transactionExpenses.length} transação(ões) tipo 'expense'
            </p>
            
            {transactionExpenses.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-blue-600 font-medium">Últimas transações:</p>
                {transactionExpenses.slice(0, 3).map((t, i) => (
                  <div key={i} className="text-xs text-blue-600">
                    • {t.description}: R$ {parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                    <Badge variant="outline" className="ml-1 text-xs">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800">📋 Lista (Tabela Expenses)</h4>
            <p className="text-2xl font-bold text-green-900">
              {tableExpenses.length} registro(s)
            </p>
            <p className="text-sm text-green-700">
              Total: R$ {tableExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            
            {tableExpenses.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-green-600 font-medium">Últimas despesas:</p>
                {tableExpenses.slice(0, 3).map((e, i) => (
                  <div key={i} className="text-xs text-green-600">
                    • {e.description}: R$ {parseFloat(e.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <Badge variant="outline" className="ml-1 text-xs">
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            <strong>💡 Análise:</strong> {
              dashboardExpenses > 0 && tableExpenses.length === 0
                ? "Dashboard mostra despesas da tabela 'transactions', mas a lista vem da tabela 'expenses' que está vazia."
                : dashboardExpenses === 0 && tableExpenses.length > 0
                ? "Lista tem despesas na tabela 'expenses', mas dashboard não encontra na tabela 'transactions'."
                : dashboardExpenses > 0 && tableExpenses.length > 0
                ? "Ambas as fontes têm dados, mas podem estar desatualizadas entre si."
                : "Nenhuma fonte tem dados de despesas."
            }
          </p>
        </div>
      </div>
    </Card>
  );
};
