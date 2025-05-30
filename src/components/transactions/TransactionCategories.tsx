
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TransactionCategories = () => {
  const categoryData = [
    { name: 'Recebimento Cliente', amount: 25000, color: '#10b981' },
    { name: 'Pagamento Serviços', amount: 8500, color: '#ef4444' },
    { name: 'Combustível', amount: 2800, color: '#f97316' },
    { name: 'Hospedagem', amount: 1200, color: '#3b82f6' },
    { name: 'Alimentação', amount: 800, color: '#10b981' },
    { name: 'Materiais', amount: 1500, color: '#eab308' },
    { name: 'Manutenção', amount: 600, color: '#8b5cf6' },
    { name: 'Despesa Escritório', amount: 1100, color: '#6366f1' }
  ];

  const expensesByEmployee = [
    { employee: 'Carlos Santos', amount: 1580.50, percentage: 35 },
    { employee: 'João Oliveira', amount: 1240.30, percentage: 28 },
    { employee: 'Ana Silva', amount: 1650.00, percentage: 37 }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Categoria</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']}
              />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Resumo por Categoria</h4>
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium text-slate-800">{category.name}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  R$ {category.amount.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Funcionário</h4>
          <div className="space-y-4">
            {expensesByEmployee.map((employee, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{employee.employee}</span>
                  <span className="font-semibold text-slate-800">
                    R$ {employee.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${employee.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-slate-600">{employee.percentage}% do total</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
