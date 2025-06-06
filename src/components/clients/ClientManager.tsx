
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { formatCurrency } from '@/utils/dateUtils';
import { ClientDetailsModal } from './ClientDetailsModal';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  total_revenue: number;
  confirmed_revenue: number;
  pending_revenue: number;
  last_transaction_date?: string;
  active: boolean;
}

export const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { showSuccess, showError } = useToastFeedback();

  React.useEffect(() => {
    loadClients();
  }, []);

  React.useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);

      // Buscar clientes básicos
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (clientsError) throw clientsError;

      // Buscar receitas confirmadas por cliente
      const { data: confirmedRevenues, error: confirmedError } = await supabase
        .from('confirmed_revenues')
        .select('client_name, total_amount, received_date');

      if (confirmedError) throw confirmedError;

      // Buscar receitas pendentes por cliente
      const { data: pendingRevenues, error: pendingError } = await supabase
        .from('pending_revenues')
        .select('client_name, total_amount, due_date')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Combinar dados
      const clientsWithRevenue = clientsData?.map(client => {
        const confirmedForClient = confirmedRevenues?.filter(r => r.client_name === client.name) || [];
        const pendingForClient = pendingRevenues?.filter(r => r.client_name === client.name) || [];

        const confirmed_revenue = confirmedForClient.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
        const pending_revenue = pendingForClient.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
        const total_revenue = confirmed_revenue + pending_revenue;

        const lastTransaction = confirmedForClient
          .sort((a, b) => new Date(b.received_date).getTime() - new Date(a.received_date).getTime())[0];

        return {
          ...client,
          total_revenue,
          confirmed_revenue,
          pending_revenue,
          last_transaction_date: lastTransaction?.received_date
        };
      }) || [];

      setClients(clientsWithRevenue);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showError('Erro', 'Não foi possível carregar os clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const getRevenueStatus = (client: Client) => {
    if (client.total_revenue === 0) return 'secondary';
    if (client.pending_revenue > client.confirmed_revenue) return 'outline';
    return 'default';
  };

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.active).length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.total_revenue, 0);
  const averageRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando clientes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {activeClients} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Confirmada + Pendente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Por cliente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(clients.reduce((sum, c) => sum + c.pending_revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestão de Clientes
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p>
                {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro cliente.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Receita Total</TableHead>
                  <TableHead>Confirmada</TableHead>
                  <TableHead>Pendente</TableHead>
                  <TableHead>Última Transação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.email && (
                          <div className="text-sm text-gray-500">{client.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.company_name || '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(client.total_revenue)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(client.confirmed_revenue)}
                    </TableCell>
                    <TableCell className="text-yellow-600">
                      {formatCurrency(client.pending_revenue)}
                    </TableCell>
                    <TableCell>
                      {client.last_transaction_date ? 
                        new Date(client.last_transaction_date).toLocaleDateString('pt-BR') : 
                        'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRevenueStatus(client)}>
                        {client.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewClient(client)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Cliente */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
};
