
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/dateUtils';

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

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Revenue {
  id: string;
  type: 'confirmed' | 'pending';
  total_amount: number;
  received_date?: string;
  due_date?: string;
  description?: string;
  mission_title?: string;
}

export const ClientDetailsModal = ({ client, isOpen, onClose }: ClientDetailsModalProps) => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      loadClientRevenues();
    }
  }, [client, isOpen]);

  const loadClientRevenues = async () => {
    if (!client) return;

    try {
      setLoading(true);

      // Buscar receitas confirmadas
      const { data: confirmedData, error: confirmedError } = await supabase
        .from('confirmed_revenues')
        .select(`
          id,
          total_amount,
          received_date,
          description,
          missions(title)
        `)
        .eq('client_name', client.name)
        .order('received_date', { ascending: false });

      if (confirmedError) throw confirmedError;

      // Buscar receitas pendentes
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_revenues')
        .select(`
          id,
          total_amount,
          due_date,
          description,
          missions(title)
        `)
        .eq('client_name', client.name)
        .eq('status', 'pending')
        .order('due_date', { ascending: false });

      if (pendingError) throw pendingError;

      // Combinar dados
      const allRevenues: Revenue[] = [
        ...(confirmedData?.map(r => ({
          id: r.id,
          type: 'confirmed' as const,
          total_amount: Number(r.total_amount) || 0,
          received_date: r.received_date,
          description: r.description,
          mission_title: (r.missions as any)?.title
        })) || []),
        ...(pendingData?.map(r => ({
          id: r.id,
          type: 'pending' as const,
          total_amount: Number(r.total_amount) || 0,
          due_date: r.due_date,
          description: r.description,
          mission_title: (r.missions as any)?.title
        })) || [])
      ];

      setRevenues(allRevenues);
    } catch (error) {
      console.error('Erro ao carregar receitas do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  const confirmedRevenues = revenues.filter(r => r.type === 'confirmed');
  const pendingRevenues = revenues.filter(r => r.type === 'pending');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Detalhes do Cliente: {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome:</p>
                  <p className="font-medium">{client.name}</p>
                </div>
                {client.company_name && (
                  <div>
                    <p className="text-sm text-gray-600">Empresa:</p>
                    <p className="font-medium">{client.company_name}</p>
                  </div>
                )}
                {client.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone:</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(client.total_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Confirmada + Pendente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(client.confirmed_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {confirmedRevenues.length} transação(ões)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Pendente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(client.pending_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingRevenues.length} pendente(s)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Receitas */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todas as Receitas</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmadas ({confirmedRevenues.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({pendingRevenues.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Completo de Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : revenues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma receita encontrada para este cliente</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Missão</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenues.map((revenue) => (
                          <TableRow key={revenue.id}>
                            <TableCell>
                              <Badge variant={revenue.type === 'confirmed' ? 'default' : 'secondary'}>
                                {revenue.type === 'confirmed' ? 'Confirmada' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(revenue.total_amount)}
                            </TableCell>
                            <TableCell>
                              {revenue.mission_title || revenue.description || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {revenue.received_date ? 
                                  new Date(revenue.received_date).toLocaleDateString('pt-BR') :
                                  revenue.due_date ? 
                                    new Date(revenue.due_date).toLocaleDateString('pt-BR') : 
                                    '-'
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              {revenue.type === 'confirmed' ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Recebida
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Aguardando
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="confirmed">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas Confirmadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {confirmedRevenues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma receita confirmada</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Valor</TableHead>
                          <TableHead>Missão</TableHead>
                          <TableHead>Data de Recebimento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {confirmedRevenues.map((revenue) => (
                          <TableRow key={revenue.id}>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(revenue.total_amount)}
                            </TableCell>
                            <TableCell>
                              {revenue.mission_title || revenue.description || '-'}
                            </TableCell>
                            <TableCell>
                              {revenue.received_date ? 
                                new Date(revenue.received_date).toLocaleDateString('pt-BR') : 
                                '-'
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRevenues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma receita pendente</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Valor</TableHead>
                          <TableHead>Missão</TableHead>
                          <TableHead>Data de Vencimento</TableHead>
                          <TableHead>Urgência</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRevenues.map((revenue) => {
                          const dueDate = revenue.due_date ? new Date(revenue.due_date) : null;
                          const today = new Date();
                          const diffDays = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                          
                          return (
                            <TableRow key={revenue.id}>
                              <TableCell className="font-semibold text-yellow-600">
                                {formatCurrency(revenue.total_amount)}
                              </TableCell>
                              <TableCell>
                                {revenue.mission_title || revenue.description || '-'}
                              </TableCell>
                              <TableCell>
                                {dueDate ? dueDate.toLocaleDateString('pt-BR') : '-'}
                              </TableCell>
                              <TableCell>
                                {diffDays !== null && (
                                  <Badge variant={diffDays < 0 ? 'destructive' : diffDays <= 7 ? 'outline' : 'secondary'}>
                                    {diffDays < 0 ? `${Math.abs(diffDays)} dias em atraso` : 
                                     diffDays <= 7 ? `Vence em ${diffDays} dias` : 
                                     'No prazo'}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
