
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from '@/hooks/useSupabaseData';

export const ExpensesByEmployee = () => {
  const [employeeExpenses, setEmployeeExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchExpenses } = useSupabaseData();

  useEffect(() => {
    loadEmployeeExpenses();
  }, []);

  const loadEmployeeExpenses = async () => {
    try {
      setLoading(true);
      const expenses = await fetchExpenses();
      
      // Agrupar despesas por funcionário
      const groupedExpenses = expenses.reduce((acc: any, expense: any) => {
        const employeeName = expense.employee_name || 'Funcionário Desconhecido';
        
        if (!acc[employeeName]) {
          acc[employeeName] = {
            employee: employeeName,
            role: expense.employee_role || 'Funcionário',
            totalExpenses: 0,
            pendingReimbursement: 0,
            missions: new Set(),
            expenses: []
          };
        }
        
        acc[employeeName].totalExpenses += parseFloat(expense.amount) || 0;
        
        if (expense.status === 'pending') {
          acc[employeeName].pendingReimbursement += parseFloat(expense.amount) || 0;
        }
        
        if (expense.missions?.title) {
          acc[employeeName].missions.add(expense.missions.title);
        }
        
        acc[employeeName].expenses.push({
          mission: expense.missions?.title || 'Missão não informada',
          amount: parseFloat(expense.amount) || 0,
          status: expense.status
        });
        
        return acc;
      }, {});

      // Converter para array e calcular total de missões
      const employeeArray = Object.values(groupedExpenses).map((emp: any) => ({
        ...emp,
        missions: emp.missions.size
      }));

      setEmployeeExpenses(employeeArray);
    } catch (error) {
      console.error('Erro ao carregar despesas por funcionário:', error);
      setEmployeeExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      reimbursed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      reimbursed: 'Reembolsado'
    };
    return labels[status as keyof typeof labels] || 'Pendente';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando despesas por funcionário...</p>
        </div>
      </Card>
    );
  }

  if (employeeExpenses.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhuma Despesa Encontrada</h3>
          <p className="text-slate-600">
            Não há despesas registradas por funcionários ainda.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {employeeExpenses.map((employee, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-800">{employee.employee}</h4>
              <p className="text-sm text-slate-600">{employee.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total em Despesas</p>
              <p className="text-xl font-bold text-slate-800">
                R$ {employee.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Missões Realizadas</p>
              <p className="text-lg font-semibold text-blue-800">{employee.missions}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-sm text-emerald-600">Total Gasto</p>
              <p className="text-lg font-semibold text-emerald-800">
                R$ {employee.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-600">Aguardando Reembolso</p>
              <p className="text-lg font-semibold text-orange-800">
                R$ {employee.pendingReimbursement.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-slate-700 mb-3">Despesas por Missão</h5>
            {employee.expenses.length > 0 ? (
              <div className="space-y-2">
                {employee.expenses.map((expense: any, expenseIndex: number) => (
                  <div key={expenseIndex} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{expense.mission}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(expense.status)}>
                        {getStatusLabel(expense.status)}
                      </Badge>
                      <p className="font-semibold text-slate-800">
                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Nenhuma despesa registrada</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
