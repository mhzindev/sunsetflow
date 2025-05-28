
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ExpensesByMission = () => {
  const missionExpenses = [
    {
      mission: 'Instalação - Cliente ABC',
      location: 'São Paulo/SP',
      period: '15-17 Jan 2024',
      status: 'completed',
      totalExpenses: 1180.50,
      employees: ['Carlos Santos', 'Ana Silva'],
      categories: [
        { name: 'Combustível', amount: 350.00 },
        { name: 'Hospedagem', amount: 450.00 },
        { name: 'Alimentação', amount: 180.50 },
        { name: 'Materiais', amount: 200.00 }
      ]
    },
    {
      mission: 'Manutenção - Cliente XYZ',
      location: 'Rio de Janeiro/RJ',
      period: '20-21 Jan 2024',
      status: 'in-progress',
      totalExpenses: 690.40,
      employees: ['João Oliveira'],
      categories: [
        { name: 'Combustível', amount: 280.00 },
        { name: 'Hospedagem', amount: 320.00 },
        { name: 'Alimentação', amount: 90.40 }
      ]
    },
    {
      mission: 'Instalação - Cliente DEF',
      location: 'Belo Horizonte/MG',
      period: '25-26 Jan 2024',
      status: 'planned',
      totalExpenses: 0,
      employees: ['Carlos Santos'],
      categories: []
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.planned;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planned: 'Planejada',
      'in-progress': 'Em Andamento',
      completed: 'Concluída'
    };
    return labels[status as keyof typeof labels] || 'Planejada';
  };

  return (
    <div className="space-y-6">
      {missionExpenses.map((mission, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-800">{mission.mission}</h4>
              <p className="text-sm text-slate-600">{mission.location} • {mission.period}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(mission.status)}>
                {getStatusLabel(mission.status)}
              </Badge>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Despesas</p>
                <p className="text-xl font-bold text-slate-800">
                  R$ {mission.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-slate-700 mb-3">Funcionários Envolvidos</h5>
              <div className="space-y-2">
                {mission.employees.map((employee, empIndex) => (
                  <div key={empIndex} className="p-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-800">{employee}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-slate-700 mb-3">Despesas por Categoria</h5>
              {mission.categories.length > 0 ? (
                <div className="space-y-2">
                  {mission.categories.map((category, catIndex) => (
                    <div key={catIndex} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">{category.name}</p>
                      <p className="text-sm font-semibold text-slate-800">
                        R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Nenhuma despesa registrada ainda</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
