
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Filter, Download, Search } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { SortSelector, SortOption } from '@/components/common/SortSelector';

interface AccountTransaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  account: string;
  category: string;
  status: string;
  account_type?: string;
  created_at?: string;
}

export const AccountTransactions = () => {
  const { user } = useAuth();
  const supabaseData = useSupabaseData();
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await supabaseData.fetchTransactions();
      
      // Filtrar apenas transações que têm account_id (movimentações de contas)
      const accountTransactions = data
        .filter(t => t.account_id)
        .map(t => ({
          id: t.id,
          date: t.date,
          description: t.description,
          type: t.type as 'income' | 'expense' | 'transfer',
          amount: t.amount,
          account: `${t.account_type === 'credit_card' ? 'Cartão' : 'Conta'} - ID: ${t.account_id?.slice(-8)}`,
          category: t.category,
          status: t.status,
          account_type: t.account_type,
          created_at: t.created_at
        }));
      
      setTransactions(accountTransactions);
    } catch (error) {
      console.error('Erro ao carregar transações de contas:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySorting = (transactions: AccountTransaction[]): AccountTransaction[] => {
    return [...transactions].sort((a, b) => {
      switch (sortOrder) {
        case 'alphabetical':
          return a.description.localeCompare(b.description);
        case 'newest':
          // Usar created_at se disponível, senão date
          const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date).getTime();
          const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date).getTime();
          return dateB - dateA;
        case 'oldest':
          // Usar created_at se disponível, senão date
          const dateAOld = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date).getTime();
          const dateBOld = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date).getTime();
          return dateAOld - dateBOld;
        default:
          return 0;
      }
    });
  };

  const filteredTransactions = applySorting(
    transactions.filter(transaction =>
      !searchTerm || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getTypeColor = (type: string) => {
    const colors = {
      income: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
      transfer: 'bg-blue-100 text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      income: 'Entrada',
      expense: 'Saída',
      transfer: 'Transferência'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      client_payment: 'Cliente',
      fuel: 'Combustível',
      accommodation: 'Hospedagem',
      meals: 'Alimentação',
      materials: 'Materiais',
      service_payment: 'Serviços',
      maintenance: 'Manutenção',
      office_expense: 'Escritório',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-slate-600">Carregando movimentações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg text-slate-800">
              Movimentações das Contas ({filteredTransactions.length})
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar movimentações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <SortSelector
                value={sortOrder}
                onChange={setSortOrder}
                className="md:w-48"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getTypeColor(transaction.type)}>
                          {getTypeLabel(transaction.type)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(transaction.category)}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-slate-800 mb-1">
                        {transaction.description}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Conta: {transaction.account}</span>
                        <span>Status: {transaction.status}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-2">
                  {transactions.length === 0 
                    ? 'Nenhuma movimentação encontrada'
                    : 'Nenhuma movimentação corresponde aos filtros aplicados'
                  }
                </p>
                <p className="text-sm text-slate-500">
                  {transactions.length === 0 
                    ? 'As movimentações das suas contas aparecerão aqui conforme você registrar transações.'
                    : 'Tente ajustar os filtros de busca.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
