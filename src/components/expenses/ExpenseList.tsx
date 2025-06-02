
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, RefreshCw, FileText } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ExpenseList = () => {
  const { expenses, loading, error, refetch } = useExpenses();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reimbursed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovada';
      case 'pending': return 'Pendente';
      case 'reimbursed': return 'Reembolsada';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryText = (category: string) => {
    const categories: { [key: string]: string } = {
      'fuel': 'Combustível',
      'accommodation': 'Hospedagem',
      'meals': 'Alimentação',
      'materials': 'Materiais',
      'transport': 'Transporte',
      'other': 'Outros'
    };
    return categories[category] || category;
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
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Erro ao carregar despesas: {error}</div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma despesa registrada ainda
          </h3>
          <p className="text-gray-500 mb-4">
            {expenses?.length || 0} despesa(s) encontrada(s). Registre sua primeira despesa de viagem.
          </p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Despesas ({expenses.length})
        </h3>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-lg text-red-600">
                    {formatCurrency(expense.amount)}
                  </span>
                  <Badge className={getStatusBadgeColor(expense.status)}>
                    {getStatusText(expense.status)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-800">{expense.description}</p>
                  <p>Categoria: {getCategoryText(expense.category)}</p>
                  <p>Data: {format(new Date(expense.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  <p>Funcionário: {expense.employee_name}</p>
                  
                  {expense.mission_id && expense.missions && (
                    <p>Missão: {expense.missions.title} - {expense.missions.location}</p>
                  )}
                  
                  {expense.employee_role && (
                    <p>Função: {expense.employee_role}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {expense.receipt && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(expense.receipt, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Comprovante
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => console.log('Ver despesa:', expense.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => console.log('Editar despesa:', expense.id)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
