
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTravelExpenses } from "@/hooks/useTravelExpenses";
import { Calendar, MapPin, User, DollarSign, RefreshCw } from "lucide-react";

export const ExpenseList = () => {
  const { expenses, loading, error, refetch } = useTravelExpenses();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprovada', className: 'bg-green-100 text-green-800' },
      reimbursed: { label: 'Reembolsada', className: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando despesas...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="mb-4">Erro ao carregar despesas: {error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Todas as Despesas ({expenses.length})</CardTitle>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma despesa registrada ainda
            </h3>
            <p className="text-gray-500">
              As despesas de viagem aparecerão aqui quando forem criadas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{expense.description}</h3>
                      {getStatusBadge(expense.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <strong>Valor:</strong> {formatCurrency(expense.amount)}
                        </p>
                        
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <strong>Data:</strong> {formatDate(expense.date)}
                        </p>
                        
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <strong>Funcionário:</strong> {expense.employee_name}
                          {expense.employee_role && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              {expense.employee_role}
                            </Badge>
                          )}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p>
                          <strong>Categoria:</strong> {expense.category}
                        </p>
                        
                        {expense.mission_title && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <strong>Missão:</strong> {expense.mission_title}
                          </p>
                        )}
                        
                        {expense.mission_location && (
                          <p>
                            <strong>Local:</strong> {expense.mission_location}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Criada em: {formatDate(expense.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
