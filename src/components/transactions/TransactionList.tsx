
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

interface EmployeeTransaction {
  id: string;
  type: 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  receipt: boolean;
}

interface OwnerTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  userName: string;
}

export const TransactionList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const mockEmployeeTransactions: EmployeeTransaction[] = [
    {
      id: '1',
      type: 'expense',
      category: 'fuel',
      description: 'Combustível viagem São Paulo',
      amount: 280.50,
      date: '2024-01-15',
      method: 'credit_card',
      status: 'completed',
      receipt: true
    },
    {
      id: '2',
      type: 'expense',
      category: 'meals',
      description: 'Almoço durante instalação',
      amount: 45.00,
      date: '2024-01-14',
      method: 'cash',
      status: 'pending',
      receipt: true
    }
  ];

  const mockOwnerTransactions: OwnerTransaction[] = [
    {
      id: '1',
      type: 'income',
      category: 'client_payment',
      description: 'Recebimento Cliente - Projeto Alpha',
      amount: 8500.00,
      date: '2024-01-15',
      method: 'transfer',
      status: 'completed',
      userName: 'Ana Silva'
    },
    {
      id: '2',
      type: 'expense',
      category: 'service_payment',
      description: 'Pagamento Prestador - João Silva',
      amount: 2500.00,
      date: '2024-01-14',
      method: 'pix',
      status: 'completed',
      userName: 'Ana Silva'
    },
    {
      id: '3',
      type: 'expense',
      category: 'fuel',
      description: 'Combustível viagem São Paulo',
      amount: 280.50,
      date: '2024-01-13',
      method: 'credit_card',
      status: 'completed',
      userName: 'Carlos Santos'
    }
  ];

  const getCategoryLabel = (category: string) => {
    const labels = {
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
    return labels[category as keyof typeof labels] || 'Outros';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      service_payment: 'bg-red-100 text-red-800',
      client_payment: 'bg-green-100 text-green-800',
      fuel: 'bg-orange-100 text-orange-800',
      accommodation: 'bg-blue-100 text-blue-800',
      meals: 'bg-emerald-100 text-emerald-800',
      materials: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-purple-100 text-purple-800',
      office_expense: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      pix: 'PIX',
      transfer: 'Transferência',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      cash: 'Dinheiro'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const transactions = user?.role === 'employee' ? mockEmployeeTransactions : mockOwnerTransactions;

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-slate-800">
          {user?.role === 'employee' ? 'Minhas Despesas' : 'Todas as Transações'}
        </h4>
        <div className="flex space-x-3">
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
          {user?.role === 'owner' && (
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            {user?.role === 'owner' && <TableHead>Usuário</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                  {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getCategoryColor(transaction.category)}>
                  {getCategoryLabel(transaction.category)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
              <TableCell className={`font-semibold ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{getMethodLabel(transaction.method)}</TableCell>
              {user?.role === 'owner' && (
                <TableCell>
                  {'userName' in transaction ? transaction.userName : 'N/A'}
                </TableCell>
              )}
              <TableCell>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status === 'pending' ? 'Pendente' : 
                   transaction.status === 'completed' ? 'Concluído' : 'Cancelado'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {'receipt' in transaction && transaction.receipt && (
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
