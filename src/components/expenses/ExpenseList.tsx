
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ExpenseList = () => {
  const mockExpenses = [
    {
      id: '1',
      mission: 'Instalação - Cliente ABC',
      employee: 'Carlos Santos',
      category: 'fuel',
      description: 'Combustível viagem São Paulo',
      amount: 280.50,
      date: '2024-01-15',
      isAdvanced: true,
      status: 'approved'
    },
    {
      id: '2',
      mission: 'Instalação - Cliente ABC',
      employee: 'Carlos Santos',
      category: 'accommodation',
      description: 'Hotel Ibis São Paulo',
      amount: 150.00,
      date: '2024-01-15',
      isAdvanced: true,
      status: 'pending'
    },
    {
      id: '3',
      mission: 'Manutenção - Cliente XYZ',
      employee: 'João Oliveira',
      category: 'meals',
      description: 'Almoço durante manutenção',
      amount: 45.00,
      date: '2024-01-14',
      isAdvanced: false,
      status: 'reimbursed'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      fuel: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-blue-100 text-blue-800',
      meals: 'bg-green-100 text-green-800',
      transportation: 'bg-purple-100 text-purple-800',
      materials: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      reimbursed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      transportation: 'Transporte',
      materials: 'Materiais',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || 'Outros';
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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-slate-800">Todas as Despesas</h4>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Filtrar</Button>
          <Button variant="outline" size="sm">Exportar</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Missão</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">{expense.mission}</TableCell>
              <TableCell>{expense.employee}</TableCell>
              <TableCell>
                <Badge className={getCategoryColor(expense.category)}>
                  {getCategoryLabel(expense.category)}
                </Badge>
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell className="font-semibold">
                R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>
                <Badge variant={expense.isAdvanced ? 'default' : 'secondary'}>
                  {expense.isAdvanced ? 'Adiantamento' : 'Reembolso'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(expense.status)}>
                  {getStatusLabel(expense.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">Ver</Button>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
