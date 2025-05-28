
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ExpensesByEmployee = () => {
  const employeeExpenses = [
    {
      employee: 'Carlos Santos',
      role: 'Técnico',
      totalExpenses: 1250.80,
      pendingReimbursement: 430.50,
      missions: 3,
      expenses: [
        { mission: 'Instalação - Cliente ABC', amount: 680.50, status: 'approved' },
        { mission: 'Manutenção - Cliente DEF', amount: 320.30, status: 'pending' },
        { mission: 'Instalação - Cliente GHI', amount: 250.00, status: 'reimbursed' }
      ]
    },
    {
      employee: 'João Oliveira',
      role: 'Técnico',
      totalExpenses: 890.40,
      pendingReimbursement: 245.00,
      missions: 2,
      expenses: [
        { mission: 'Manutenção - Cliente XYZ', amount: 645.40, status: 'approved' },
        { mission: 'Instalação - Cliente JKL', amount: 245.00, status: 'pending' }
      ]
    },
    {
      employee: 'Ana Silva',
      role: 'Proprietária',
      totalExpenses: 2150.90,
      pendingReimbursement: 0,
      missions: 4,
      expenses: [
        { mission: 'Supervisão - Cliente ABC', amount: 450.50, status: 'approved' },
        { mission: 'Supervisão - Cliente XYZ', amount: 380.40, status: 'approved' },
        { mission: 'Reunião - Cliente DEF', amount: 320.00, status: 'approved' },
        { mission: 'Auditoria - Cliente GHI', amount: 1000.00, status: 'approved' }
      ]
    }
  ];

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
            <div className="space-y-2">
              {employee.expenses.map((expense, expenseIndex) => (
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
          </div>
        </Card>
      ))}
    </div>
  );
};
