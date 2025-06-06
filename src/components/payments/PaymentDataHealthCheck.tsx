
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Wrench, RefreshCw } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useOrphanPaymentsFix } from '@/hooks/useOrphanPaymentsFix';
import { Payment } from '@/types/payment';

interface PaymentHealthData {
  totalPayments: number;
  orphanPayments: number;
  validPayments: number;
  orphanList: Payment[];
}

export const PaymentDataHealthCheck = () => {
  const [healthData, setHealthData] = useState<PaymentHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { fetchPayments } = useSupabaseData();
  const { fixOrphanPayments, isFixing } = useOrphanPaymentsFix();

  const checkDataHealth = async () => {
    try {
      setLoading(true);
      console.log('Verificando saúde dos dados de pagamento...');
      
      const payments = await fetchPayments();
      
      const orphanPayments = payments.filter(p => !p.providerId || p.providerId === '' || p.providerId === 'undefined');
      const validPayments = payments.filter(p => p.providerId && p.providerId !== '' && p.providerId !== 'undefined');
      
      const healthData: PaymentHealthData = {
        totalPayments: payments.length,
        orphanPayments: orphanPayments.length,
        validPayments: validPayments.length,
        orphanList: orphanPayments
      };
      
      console.log('Dados de saúde:', healthData);
      setHealthData(healthData);
    } catch (error) {
      console.error('Erro ao verificar saúde dos dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFixOrphans = async () => {
    const result = await fixOrphanPayments();
    if (result.success) {
      // Recarregar dados após correção
      await checkDataHealth();
    }
  };

  useEffect(() => {
    checkDataHealth();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2">Verificando integridade dos dados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return null;
  }

  const healthPercentage = healthData.totalPayments > 0 
    ? Math.round((healthData.validPayments / healthData.totalPayments) * 100)
    : 100;

  const isHealthy = healthData.orphanPayments === 0;

  return (
    <Card className={`border-2 ${isHealthy ? 'border-green-200' : 'border-orange-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          )}
          Integridade dos Dados de Pagamento
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{healthData.totalPayments}</div>
            <div className="text-sm text-gray-600">Total de Pagamentos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{healthData.validPayments}</div>
            <div className="text-sm text-gray-600">Pagamentos Válidos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{healthData.orphanPayments}</div>
            <div className="text-sm text-gray-600">Pagamentos Órfãos</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Saúde dos Dados:</span>
            <Badge variant={isHealthy ? "default" : "secondary"} className={isHealthy ? "bg-green-600" : "bg-orange-600"}>
              {healthPercentage}% Íntegros
            </Badge>
          </div>
          
          {!isHealthy && (
            <div className="flex gap-2">
              <Button
                onClick={checkDataHealth}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Verificar Novamente
              </Button>
              
              <Button
                onClick={handleFixOrphans}
                variant="default"
                size="sm"
                disabled={isFixing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Wrench className={`w-4 h-4 mr-2 ${isFixing ? 'animate-spin' : ''}`} />
                {isFixing ? 'Corrigindo...' : 'Corrigir Órfãos'}
              </Button>
            </div>
          )}
        </div>

        {!isHealthy && healthData.orphanList.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Pagamentos Órfãos Detectados:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {healthData.orphanList.slice(0, 5).map((payment) => (
                <div key={payment.id} className="text-sm text-orange-700">
                  • {payment.providerName || 'Nome não especificado'} - R$ {payment.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              ))}
              {healthData.orphanList.length > 5 && (
                <div className="text-sm text-orange-600 italic">
                  ... e mais {healthData.orphanList.length - 5} pagamento(s)
                </div>
              )}
            </div>
          </div>
        )}

        {isHealthy && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-800">
              ✅ Todos os pagamentos estão corretamente vinculados aos prestadores de serviço.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
