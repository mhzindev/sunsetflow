import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BalanceCard } from './BalanceCard';
import { ProviderBalanceDetails } from './ProviderBalanceDetails';
import { useProviderBalanceDetails } from '@/hooks/useProviderBalanceDetails';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Calendar, MapPin, RefreshCw, Bell, Eye, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [missions, setMissions] = useState<Mission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  const { balanceDetails, loading: balanceLoading, recalculate } = useProviderBalanceDetails(profile?.provider_id || '');

  const loadProviderData = async () => {
    if (!profile?.provider_id) return;

    try {
      setLoading(true);
      console.log('Carregando dados do prestador:', profile.provider_id);

      // Buscar missões do prestador com filtro correto
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          id, title, client_name, location, status, start_date, end_date,
          provider_value, assigned_providers, provider_id, is_approved
        `)
        .or(`provider_id.eq.${profile.provider_id},assigned_providers.cs.{${profile.provider_id}}`);

      if (missionsError) {
        console.error('Erro ao buscar missões:', missionsError);
      } else {
        console.log('Missões encontradas:', missionsData);
        
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
        
        setMissions(processedMissions);
      }

      // Buscar pagamentos do prestador
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_id', profile.provider_id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
      } else {
        setPayments(paymentsData || []);
      }
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

  const getTooltipText = (type: string) => {
    const tooltips = {
      availableBalance: "Valor disponível para recebimento (acumulado - pagamentos - recebimentos marcados)",
      accumulatedBalance: "Total acumulado que você gerou com missões aprovadas",
      missions: "Número de missões aprovadas que você participou",
      pendingPayments: "Valor de pagamentos que ainda não foram processados pela empresa"
    };
    return tooltips[type as keyof typeof tooltips] || "";
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

  if (loading || balanceLoading) {
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

      {/* Cards de Estatísticas com Nova Lógica */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BalanceCard
          title="Saldo Disponível"
          value={formatCurrency(balanceDetails.availableBalance)}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          className="bg-green-50"
          tooltip={getTooltipText('availableBalance')}
          isProvider={true}
        />

        <BalanceCard
          title="Saldo Acumulado"
          value={formatCurrency(balanceDetails.accumulatedBalance)}
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          className="bg-orange-50"
          tooltip={getTooltipText('accumulatedBalance')}
          isProvider={true}
        />

        <BalanceCard
          title="Missões Pendentes"
          value={`${balanceDetails.pendingMissionsCount}`}
          icon={<Eye className="w-6 h-6 text-purple-600" />}
          className="bg-purple-50"
          tooltip="Missões criadas por você aguardando aprovação"
          isProvider={true}
        />

        <BalanceCard
          title="Missões Aprovadas"
          value={`${balanceDetails.missionsCount}`}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          className="bg-blue-50"
          tooltip={getTooltipText('missions')}
          isProvider={true}
        />
      </div>

      {/* Alertas sobre Missões Pendentes */}
      {balanceDetails.pendingMissionsCount > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">
                Você tem {balanceDetails.pendingMissionsCount} {balanceDetails.pendingMissionsCount === 1 ? 'missão pendente' : 'missões pendentes'}
              </h4>
              <p className="text-yellow-700 text-sm">
                Essas missões estão aguardando aprovação da empresa para serem incluídas no seu saldo.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Botão para ver detalhes do saldo */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Detalhes do Saldo
            </CardTitle>
            <Button 
              onClick={() => setShowBalanceDetails(!showBalanceDetails)}
              variant="outline"
            >
              {showBalanceDetails ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ocultar Detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {showBalanceDetails && (
          <CardContent>
            <ProviderBalanceDetails
              providerId={profile?.provider_id || ''}
              providerName={profile?.name || 'Prestador'}
              currentBalance={balanceDetails.currentBalance}
              onRecalculate={recalculate}
            />
          </CardContent>
        )}
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
                      <TableHead>Meu Valor</TableHead>
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
                            <span className="text-gray-400">Aguardando aprovação</span>
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
