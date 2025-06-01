
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseData } from '@/hooks/useSupabaseData';

export const ExpensesByMission = () => {
  const [missionExpenses, setMissionExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchMissions, fetchExpenses } = useSupabaseData();

  useEffect(() => {
    loadMissionExpenses();
  }, []);

  const loadMissionExpenses = async () => {
    try {
      setLoading(true);
      const [missions, expenses] = await Promise.all([
        fetchMissions(),
        fetchExpenses()
      ]);
      
      // Processar cada missão e suas despesas
      const processedMissions = missions.map((mission: any) => {
        const missionExpenses = expenses.filter((expense: any) => expense.mission_id === mission.id);
        
        // Calcular totais por categoria
        const categories = missionExpenses.reduce((acc: any, expense: any) => {
          const category = expense.category || 'Outros';
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += parseFloat(expense.amount) || 0;
          return acc;
        }, {});

        // Converter categorias para array
        const categoriesArray = Object.entries(categories).map(([name, amount]) => ({
          name,
          amount: amount as number
        }));

        // Obter funcionários únicos
        const employees = [...new Set(missionExpenses.map((expense: any) => expense.employee_name))].filter(Boolean);

        return {
          mission: mission.title,
          location: mission.location,
          period: `${new Date(mission.start_date).toLocaleDateString('pt-BR')}${mission.end_date ? ` - ${new Date(mission.end_date).toLocaleDateString('pt-BR')}` : ''}`,
          status: mission.status,
          totalExpenses: mission.total_expenses || 0,
          employees: employees.length > 0 ? employees : ['Nenhum funcionário atribuído'],
          categories: categoriesArray
        };
      });

      setMissionExpenses(processedMissions);
    } catch (error) {
      console.error('Erro ao carregar despesas por missão:', error);
      setMissionExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Planejada',
      'in-progress': 'Em Andamento',
      completed: 'Concluída'
    };
    return labels[status as keyof typeof labels] || 'Planejada';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando despesas por missão...</p>
        </div>
      </Card>
    );
  }

  if (missionExpenses.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhuma Missão Encontrada</h3>
          <p className="text-slate-600">
            Não há missões cadastradas ainda. Crie uma missão para começar a controlar despesas.
          </p>
        </div>
      </Card>
    );
  }

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
                {mission.employees.map((employee: string, empIndex: number) => (
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
                  {mission.categories.map((category: any, catIndex: number) => (
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
