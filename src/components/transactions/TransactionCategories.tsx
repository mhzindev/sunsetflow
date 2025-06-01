import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseData } from '@/hooks/useSupabaseData';

export const TransactionCategories = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [expensesByEmployee, setExpensesByEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchTransactions, fetchExpenses } = useSupabaseData();

  useEffect(() => {
    loadCategoryData();
  }, []);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const [transactions, expenses] = await Promise.all([
        fetchTransactions(),
        fetchExpenses()
      ]);

      // Processar transações por categoria
      const transactionCategories = transactions.reduce((acc: any, transaction: any) => {
        const category = getCategoryLabel(String(transaction.category || 'other'));
        if (!acc[category]) {
          acc[category] = 0;
        }
        const amount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount) || 0;
        acc[category] += amount;
        return acc;
      }, {});

      // Converter para array com cores
      const categoryArray = Object.entries(transactionCategories).map(([name, amount], index) => ({
        name,
        amount: amount as number,
        color: getRandomColor(index)
      }));

      setCategoryData(categoryArray);

      // Processar despesas por funcionário
      const employeeExpenses = expenses.reduce((acc: any, expense: any) => {
        const employeeName = expense.employee_name || 'Funcionário Desconhecido';
        if (!acc[employeeName]) {
          acc[employeeName] = 0;
        }
        const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
        acc[employeeName] += amount;
        return acc;
      }, {});

      // Calcular total e percentuais
      const totalExpenses = Object.values(employeeExpenses).reduce((sum: number, amount: unknown) => {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
        return sum + numAmount;
      }, 0);
      
      const employeeArray = Object.entries(employeeExpenses).map(([employee, amount]: [string, unknown]) => {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
        const percentage = totalExpenses > 0 ? Math.round((numAmount / totalExpenses) * 100) : 0;
        return {
          employee,
          amount: numAmount,
          percentage
        };
      });

      setExpensesByEmployee(employeeArray);
    } catch (error) {
      console.error('Erro ao carregar dados de categorias:', error);
      setCategoryData([]);
      setExpensesByEmployee([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      service_payment: 'Pagamento Serviços',
      client_payment: 'Recebimento Cliente',
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      maintenance: 'Manutenção',
      office_expense: 'Despesa Escritório',
      other: 'Outros'
    };
    return labels[category] || category;
  };

  const getRandomColor = (index: number) => {
    const colors = [
      '#10b981', '#ef4444', '#f97316', '#3b82f6', 
      '#eab308', '#8b5cf6', '#6366f1', '#06b6d4'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados por categoria...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Categoria</h4>
        {categoryData.length > 0 ? (
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
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="mb-2">Sem dados para exibir</p>
              <p className="text-sm">Registre transações para visualizar categorias</p>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Resumo por Categoria</h4>
          {categoryData.length > 0 ? (
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
          ) : (
            <p className="text-slate-500 text-center py-8">Nenhuma categoria encontrada</p>
          )}
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Despesas por Funcionário</h4>
          {expensesByEmployee.length > 0 ? (
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
          ) : (
            <p className="text-slate-500 text-center py-8">Nenhuma despesa por funcionário encontrada</p>
          )}
        </Card>
      </div>
    </div>
  );
};
