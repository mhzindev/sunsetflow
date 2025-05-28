
import { Card } from "@/components/ui/card";

export const CashFlowChart = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Fluxo de Caixa - Últimos 6 meses</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
            <span className="text-slate-600">Receitas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-slate-600">Despesas</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 bg-slate-50 rounded-lg flex items-end justify-around p-4">
        {/* Placeholder for chart - seria substituído por uma biblioteca de gráficos */}
        {[65, 45, 78, 52, 89, 43].map((height, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="flex space-x-1">
              <div 
                className="w-6 bg-emerald-500 rounded-t"
                style={{ height: `${height}px` }}
              ></div>
              <div 
                className="w-6 bg-red-500 rounded-t"
                style={{ height: `${height * 0.6}px` }}
              ></div>
            </div>
            <span className="text-xs text-slate-600">
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][index]}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
