
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RLSStatus {
  isActive: boolean;
  companyIsolated: boolean;
  userCompanyId: string | null;
  totalTransactions: number;
  totalPayments: number;
  error?: string;
}

export const RLSStatusIndicator = () => {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<RLSStatus>({
    isActive: false,
    companyIsolated: false,
    userCompanyId: null,
    totalTransactions: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      checkRLSStatus();
    }
  }, [user, profile]);

  const checkRLSStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verificando status do RLS...');

      const userCompanyId = profile?.company_id;

      // Buscar transações com RLS ativo
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, company_id');

      // Buscar pagamentos com RLS ativo
      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('id, company_id');

      if (transError || payError) {
        console.error('❌ Erro ao verificar RLS:', transError || payError);
        setStatus({
          isActive: false,
          companyIsolated: false,
          userCompanyId,
          totalTransactions: 0,
          totalPayments: 0,
          error: `Erro ao verificar RLS: ${transError?.message || payError?.message}`
        });
        return;
      }

      // Verificar se todos os dados pertencem à mesma empresa do usuário
      const allTransactionsBelongToCompany = transactions?.every(t => t.company_id === userCompanyId) ?? true;
      const allPaymentsBelongToCompany = payments?.every(p => p.company_id === userCompanyId) ?? true;

      const isCompanyIsolated = allTransactionsBelongToCompany && allPaymentsBelongToCompany;

      console.log('✅ Status RLS verificado:', {
        userCompanyId,
        totalTransactions: transactions?.length || 0,
        totalPayments: payments?.length || 0,
        isCompanyIsolated
      });

      setStatus({
        isActive: true,
        companyIsolated: isCompanyIsolated,
        userCompanyId,
        totalTransactions: transactions?.length || 0,
        totalPayments: payments?.length || 0
      });

    } catch (error) {
      console.error('💥 Erro ao verificar status RLS:', error);
      setStatus({
        isActive: false,
        companyIsolated: false,
        userCompanyId: profile?.company_id || null,
        totalTransactions: 0,
        totalPayments: 0,
        error: 'Erro ao verificar status do sistema'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">Verificando isolamento de dados...</span>
        </div>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (status.error) return 'bg-red-50 border-red-200';
    if (!status.isActive) return 'bg-yellow-50 border-yellow-200';
    if (status.companyIsolated) return 'bg-green-50 border-green-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getStatusIcon = () => {
    if (status.error) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (!status.isActive) return <Shield className="h-5 w-5 text-yellow-600" />;
    if (status.companyIsolated) return <ShieldCheck className="h-5 w-5 text-green-600" />;
    return <AlertTriangle className="h-5 w-5 text-orange-600" />;
  };

  const getStatusText = () => {
    if (status.error) return 'Erro no Sistema';
    if (!status.isActive) return 'RLS Inativo';
    if (status.companyIsolated) return 'Isolamento Ativo';
    return 'Isolamento Parcial';
  };

  const getStatusBadge = () => {
    if (status.error) return <Badge variant="destructive">Erro</Badge>;
    if (!status.isActive) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Inativo</Badge>;
    if (status.companyIsolated) return <Badge className="bg-green-600">Seguro</Badge>;
    return <Badge variant="outline" className="border-orange-500 text-orange-700">Atenção</Badge>;
  };

  return (
    <Card className={`p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{getStatusText()}</span>
              {getStatusBadge()}
            </div>
            {status.error ? (
              <p className="text-xs text-red-700 mt-1">{status.error}</p>
            ) : (
              <div className="text-xs mt-1">
                <span className="text-gray-600">
                  Empresa: {status.userCompanyId?.slice(-8) || 'N/A'} | 
                  Transações: {status.totalTransactions} | 
                  Pagamentos: {status.totalPayments}
                </span>
              </div>
            )}
          </div>
        </div>
        {!status.error && (
          <button 
            onClick={checkRLSStatus}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Verificar novamente"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {status.companyIsolated && (
        <div className="mt-2 text-xs text-green-700">
          ✅ Todos os dados exibidos pertencem exclusivamente à sua empresa
        </div>
      )}
      
      {!status.companyIsolated && !status.error && (
        <div className="mt-2 text-xs text-orange-700">
          ⚠️ Possível vazamento de dados entre empresas detectado
        </div>
      )}
    </Card>
  );
};
