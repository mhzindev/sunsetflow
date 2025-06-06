
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BalanceCard } from './BalanceCard';
import { useProviderBalanceDetails } from '@/hooks/useProviderBalanceDetails';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ProviderBalanceDetailsEnhancedProps {
  providerId: string;
  providerName: string;
  currentBalance: number;
  onRecalculate?: () => void;
  isProvider?: boolean;
}

interface Mission {
  id: string;
  title: string;
  client_name: string;
  earned_value: number;
  approved_at: string;
  location: string;
  is_approved: boolean;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
  description: string;
}

export const ProviderBalanceDetailsEnhanced = ({ 
  providerId, 
  providerName, 
  currentBalance,
  onRecalculate,
  isProvider = false
}: ProviderBalanceDetailsEnhancedProps) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recalculating, setRecalculating] = useState(false);

  const { balanceDetails, loading, recalculate } = useProviderBalanceDetails(providerId);
  const { showSuccess, showError } = useToastFeedback();

  const loadProviderDetails = async () => {
    try {
      // Buscar todas as missões do prestador (aprovadas e pendentes)
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          id, title, client_name, provider_value, approved_at, location,
          assigned_providers, provider_id, is_approved
        `)
        .or(`provider_id.eq.${providerId},assigned_providers.cs.{${providerId}}`);

      if (missionsError) {
        console.error('Erro ao buscar missões:', missionsError);
      } else {
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
            location: mission.location,
            is_approved: mission.is_approved
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
        await recalculate();
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTooltipText = (type: string) => {
    const tooltips = {
      totalEarned: isProvider 
        ? "Total que você ganhou com missões aprovadas até agora"
        : "Total ganho pelo prestador em missões aprovadas",
      totalPaid: isProvider 
        ? "Total que você já recebeu em pagamentos"
        : "Total pago ao prestador até o momento",
      availableBalance: isProvider 
        ? "Valor disponível para saque (ganhos - pagamentos recebidos)"
        : "Saldo atual do prestador disponível para pagamento",
      accumulatedBalance: isProvider 
        ? "Valor estimado de missões ainda não aprovadas"
        : "Valor previsto de missões pendentes de aprovação",
      missions: isProvider 
        ? "Número de missões aprovadas que você participou"
        : "Quantidade de missões aprovadas do prestador"
    };
    return tooltips[type as keyof typeof tooltips] || "";
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <BalanceCard
              title="Total Ganho"
              value={formatCurrency(balanceDetails.totalEarned)}
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              className="bg-green-50"
              tooltip={getTooltipText('totalEarned')}
              isProvider={isProvider}
            />
            
            <BalanceCard
              title="Total Pago"
              value={formatCurrency(balanceDetails.totalPaid)}
              icon={<TrendingDown className="w-5 h-5 text-red-600" />}
              className="bg-red-50"
              tooltip={getTooltipText('totalPaid')}
              isProvider={isProvider}
            />
            
            <BalanceCard
              title="Saldo Disponível"
              value={formatCurrency(balanceDetails.availableBalance)}
              icon={<DollarSign className="w-5 h-5 text-blue-600" />}
              className="bg-blue-50"
              tooltip={getTooltipText('availableBalance')}
              isProvider={isProvider}
            />
            
            <BalanceCard
              title="Saldo Acumulado"
              value={formatCurrency(balanceDetails.accumulatedBalance)}
              icon={<Eye className="w-5 h-5 text-purple-600" />}
              className="bg-purple-50"
              tooltip={getTooltipText('accumulatedBalance')}
              isProvider={isProvider}
            />
            
            <BalanceCard
              title="Missões"
              value={`${balanceDetails.missionsCount} aprovadas`}
              icon={<Clock className="w-5 h-5 text-orange-600" />}
              className="bg-orange-50"
              tooltip={getTooltipText('missions')}
              isProvider={isProvider}
            />
          </div>

          {balanceDetails.pendingMissionsCount > 0 && (
            <Card className="p-4 bg-yellow-50 border-yellow-200 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    {balanceDetails.pendingMissionsCount} {balanceDetails.pendingMissionsCount === 1 ? 'missão pendente' : 'missões pendentes'}
                  </h4>
                  <p className="text-yellow-700 text-sm">
                    {isProvider 
                      ? `Você tem ${formatCurrency(balanceDetails.accumulatedBalance)} em missões aguardando aprovação`
                      : `Prestador tem ${formatCurrency(balanceDetails.accumulatedBalance)} em missões pendentes de aprovação`
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Tabs defaultValue="missions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="missions">Missões ({missions.length})</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos ({payments.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="missions" className="mt-4">
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
                      <TableHead>Valor Ganho</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missions.map((mission) => (
                      <TableRow key={mission.id}>
                        <TableCell className="font-medium">{mission.title}</TableCell>
                        <TableCell>{mission.client_name || 'N/A'}</TableCell>
                        <TableCell>{mission.location}</TableCell>
                        <TableCell className={`font-semibold ${mission.is_approved ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatCurrency(mission.earned_value)}
                        </TableCell>
                        <TableCell>
                          <Badge className={mission.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {mission.is_approved ? 'Aprovada' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mission.approved_at 
                            ? new Date(mission.approved_at).toLocaleDateString('pt-BR')
                            : '-'
                          }
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
