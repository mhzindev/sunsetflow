
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Calendar, MapPin, RefreshCw, Bell } from 'lucide-react';

interface ProviderStats {
  currentBalance: number;
  totalEarned: number;
  missionsCount: number;
  pendingPayments: number;
}

interface Mission {
  id: string;
  title: string;
  client_name: string;
  location: string;
  status: string;
  start_date: string;
  end_date?: string;
  earned_value: number;
  is_approved: boolean;
}

interface Payment {
  id: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  description: string;
}

export const ProviderDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<ProviderStats>({
    currentBalance: 0,
    totalEarned: 0,
    missionsCount: 0,
    pendingPayments: 0
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProviderData = async () => {
    if (!profile?.provider_id) return;

    try {
      setLoading(true);

      // Buscar dados do prestador
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('current_balance')
        .eq('id', profile.provider_id)
        .single();

      if (providerError) {
        console.error('Erro ao buscar dados do prestador:', providerError);
        return;
      }

      // Buscar missões do prestador
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          id, title, client_name, location, status, start_date, end_date,
          provider_value, assigned_providers, provider_id, is_approved
        `)
        .or(`provider_id.eq.${profile.provider_id},assigned_providers.cs.{${profile.provider_id}}`);

      if (missionsError) {
        console.error('Erro ao buscar missões:', missionsError);
      }

      // Buscar pagamentos do prestador
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_id', profile.provider_id)
        .order('due_date', { ascending: false });

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
      }

      // Processar dados das missões
      const processedMissions = missionsData?.map(mission => {
        let earnedValue = 0;
        
        if (mission.is_approved) {
          if (mission.provider_id === profile.provider_id) {
            earnedValue = mission.provider_value;
          } else if (mission.assigned_providers?.includes(profile.provider_id)) {
            earnedValue = mission.provider_value / (mission.assigned_providers?.length || 1);
          }
        }
        
        return {
          ...mission,
          earned_value: earnedValue
        };
      }) || [];

      // Calcular estatísticas
      const totalEarned = processedMissions
        .filter(m => m.is_approved)
        .reduce((sum, mission) => sum + mission.earned_value, 0);

      const pendingPayments = paymentsData
        ?.filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0) || 0;

      setStats({
        currentBalance: providerData?.current_balance || 0,
        totalEarned,
        missionsCount: processedMissions.length,
        pendingPayments
      });

      setMissions(processedMissions);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.provider_id) {
      loadProviderData();
    }
  }, [profile?.provider_id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string, isApproved?: boolean) => {
    if (isApproved) {
      return <Badge className="bg-green-100 text-green-800">✓ Aprovada</Badge>;
    }
    
    const statusConfig = {
      planning: { label: 'Planejamento', className: 'bg-blue-100 text-blue-800' },
      'in-progress': { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando seu painel...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Meu Painel</h1>
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
          <Bell className="w-4 h-4" />
          Prestador de Serviços
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.currentBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Ganho</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalEarned)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Missões</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.missionsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pag. Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pendingPayments)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações sobre Saldo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Sobre Seu Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Como funciona seu saldo?</h4>
              <p className="text-blue-700 text-sm">
                Seu saldo é calculado automaticamente com base nas missões aprovadas. 
                Quando uma missão é aprovada, sua parte do valor é adicionada ao seu saldo. 
                Quando você recebe um pagamento, o valor é deduzido do saldo.
              </p>
            </div>
            
            {stats.currentBalance > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">💰 Você tem saldo para receber!</h4>
                <p className="text-green-700 text-sm">
                  Seu saldo atual é de <strong>{formatCurrency(stats.currentBalance)}</strong>. 
                  Entre em contato com a empresa para solicitar o pagamento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs para Missões e Pagamentos */}
      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="missions">
            Minhas Missões ({missions.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            Meus Pagamentos ({payments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="missions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Missões</CardTitle>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma missão encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Missão</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor Ganho</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-medium">{mission.title}</TableCell>
                        <TableCell>{mission.client_name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {mission.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(mission.start_date).toLocaleDateString('pt-BR')}
                          {mission.end_date && ` - ${new Date(mission.end_date).toLocaleDateString('pt-BR')}`}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(mission.status, mission.is_approved)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {mission.is_approved ? (
                            <span className="text-green-600">
                              {formatCurrency(mission.earned_value)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
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
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pagamento encontrado
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {payment.payment_date 
                            ? new Date(payment.payment_date).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              payment.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {payment.status === 'completed' ? 'Pago' : 
                             payment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
