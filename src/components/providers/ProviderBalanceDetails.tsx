import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, RefreshCw } from 'lucide-react';

interface ProviderBalanceDetailsProps {
  providerId: string;
  providerName: string;
  currentBalance: number;
  onRecalculate?: () => void;
}

interface MissionEarning {
  id: string;
  title: string;
  client_name: string;
  earned_value: number;
  approved_at: string;
  location: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
  description: string;
}

export const ProviderBalanceDetails = ({ 
  providerId, 
  providerName, 
  currentBalance,
  onRecalculate 
}: ProviderBalanceDetailsProps) => {
  const [missions, setMissions] = useState<MissionEarning[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const { showSuccess, showError } = useToastFeedback();

  const loadProviderDetails = async () => {
    try {
      setLoading(true);
      
      // Buscar missões aprovadas do prestador
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          id, title, client_name, provider_value, approved_at, location,
          assigned_providers, provider_id
        `)
        .eq('is_approved', true)
        .or(`provider_id.eq.${providerId},assigned_providers.cs.{${providerId}}`);

      if (missionsError) {
        console.error('Erro ao buscar missões:', missionsError);
      } else {
        // Calcular valor ganho por missão
        const earnings = missionsData?.map(mission => {
          let earnedValue = 0;
          
          if (mission.provider_id === providerId) {
            earnedValue = mission.provider_value;
          } else if (mission.assigned_providers?.includes(providerId)) {
            earnedValue = mission.provider_value / (mission.assigned_providers?.length || 1);
          }
          
          return {
            id: mission.id,
            title: mission.title,
            client_name: mission.client_name,
            earned_value: earnedValue,
            approved_at: mission.approved_at,
            location: mission.location
          };
        }) || [];
        
        setMissions(earnings);
      }

      // Buscar pagamentos do prestador
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError);
      } else {
        setPayments(paymentsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      showError('Erro', 'Erro ao carregar detalhes do prestador');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateBalance = async () => {
    try {
      setRecalculating(true);
      
      const { data, error } = await supabase.rpc('recalculate_provider_balance', {
        provider_uuid: providerId
      });

      if (error) {
        console.error('Erro ao recalcular saldo:', error);
        showError('Erro', 'Erro ao recalcular saldo');
      } else {
        showSuccess('Sucesso', `Saldo recalculado: R$ ${data?.toFixed(2) || '0,00'}`);
        onRecalculate?.();
        await loadProviderDetails();
      }
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      showError('Erro', 'Erro ao recalcular saldo');
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      loadProviderDetails();
    }
  }, [providerId]);

  const totalEarned = missions.reduce((sum, mission) => sum + mission.earned_value, 0);
  const totalPaid = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando detalhes...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Detalhes do Saldo - {providerName}
              </CardTitle>
            </div>
            <Button 
              onClick={handleRecalculateBalance}
              disabled={recalculating}
              variant="outline"
              size="sm"
            >
              {recalculating ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Recalcular
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Ganho</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(totalEarned)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Pago</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Saldo Atual</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(currentBalance)}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Missões</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {missions.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="missions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="missions">Missões ({missions.length})</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos ({payments.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="missions" className="mt-4">
              {missions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma missão aprovada encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Missão</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Valor Ganho</TableHead>
                      <TableHead>Data Aprovação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-medium">{mission.title}</TableCell>
                        <TableCell>{mission.client_name || 'N/A'}</TableCell>
                        <TableCell>{mission.location}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(mission.earned_value)}
                        </TableCell>
                        <TableCell>
                          {new Date(mission.approved_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="payments" className="mt-4">
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
                      <TableHead>Data Vencimento</TableHead>
                      <TableHead>Data Pagamento</TableHead>
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
                            {payment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {payment.status === 'completed' ? 'Pago' : 
                             payment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
