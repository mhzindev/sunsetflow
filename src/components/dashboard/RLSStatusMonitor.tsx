
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, AlertTriangle, RefreshCw, Eye } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RLSMonitorStatus {
  jwtClaims: any;
  isRLSActive: boolean;
  companyIsolated: boolean;
  totalTransactions: number;
  totalPayments: number;
  error?: string;
}

export const RLSStatusMonitor = () => {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<RLSMonitorStatus>({
    jwtClaims: null,
    isRLSActive: false,
    companyIsolated: false,
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

      // 1. Verificar JWT claims
      const { data: { session } } = await supabase.auth.getSession();
      const jwtClaims = session?.access_token ? 
        JSON.parse(atob(session.access_token.split('.')[1])) : null;

      console.log('JWT Claims:', jwtClaims);

      // 2. Testar isolamento RLS fazendo queries simples
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, company_id')
        .limit(100);

      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('id, company_id')
        .limit(100);

      if (transError || payError) {
        setStatus({
          jwtClaims,
          isRLSActive: false,
          companyIsolated: false,
          totalTransactions: 0,
          totalPayments: 0,
          error: `Erro RLS: ${transError?.message || payError?.message}`
        });
        return;
      }

      // 3. Verificar se todos os dados pertencem à empresa do usuário
      const userCompanyId = profile?.company_id || jwtClaims?.company_id;
      const allTransactionsBelongToCompany = transactions?.every(t => 
        t.company_id === userCompanyId
      ) ?? true;
      
      const allPaymentsBelongToCompany = payments?.every(p => 
        p.company_id === userCompanyId
      ) ?? true;

      setStatus({
        jwtClaims,
        isRLSActive: true,
        companyIsolated: allTransactionsBelongToCompany && allPaymentsBelongToCompany,
        totalTransactions: transactions?.length || 0,
        totalPayments: payments?.length || 0
      });

    } catch (error) {
      console.error('Erro ao verificar status RLS:', error);
      setStatus({
        jwtClaims: null,
        isRLSActive: false,
        companyIsolated: false,
        totalTransactions: 0,
        totalPayments: 0,
        error: 'Erro ao verificar sistema de isolamento'
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
          <span className="text-sm text-blue-800">Verificando isolamento RLS...</span>
        </div>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (status.error) return 'bg-red-50 border-red-200';
    if (!status.isRLSActive) return 'bg-yellow-50 border-yellow-200';
    if (status.companyIsolated && status.jwtClaims?.company_id) return 'bg-green-50 border-green-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getStatusIcon = () => {
    if (status.error) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (!status.isRLSActive) return <Shield className="h-5 w-5 text-yellow-600" />;
    if (status.companyIsolated && status.jwtClaims?.company_id) return <ShieldCheck className="h-5 w-5 text-green-600" />;
    return <Eye className="h-5 w-5 text-orange-600" />;
  };

  const getStatusText = () => {
    if (status.error) return 'Erro no Sistema';
    if (!status.isRLSActive) return 'RLS Inativo';
    if (status.companyIsolated && status.jwtClaims?.company_id) return 'Isolamento RLS Ativo';
    return 'Configuração Pendente';
  };

  const getStatusBadge = () => {
    if (status.error) return <Badge variant="destructive">Erro</Badge>;
    if (!status.isRLSActive) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Inativo</Badge>;
    if (status.companyIsolated && status.jwtClaims?.company_id) return <Badge className="bg-green-600">Seguro</Badge>;
    return <Badge variant="outline" className="border-orange-500 text-orange-700">Configurando</Badge>;
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
              <div className="text-xs mt-1 space-y-1">
                <div className="text-gray-600">
                  JWT Company: {status.jwtClaims?.company_id?.slice(-8) || 'N/A'} | 
                  Profile Company: {profile?.company_id?.slice(-8) || 'N/A'}
                </div>
                <div className="text-gray-600">
                  Transações: {status.totalTransactions} | 
                  Pagamentos: {status.totalPayments}
                </div>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={checkRLSStatus}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Verificar novamente"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      {status.companyIsolated && status.jwtClaims?.company_id && (
        <div className="mt-2 text-xs text-green-700">
          ✅ Isolamento RLS ativo - Dados filtrados automaticamente por empresa
        </div>
      )}
      
      {!status.jwtClaims?.company_id && (
        <div className="mt-2 text-xs text-orange-700">
          ⚠️ Company_id não encontrado no JWT - Configure Custom Access Token Hook
        </div>
      )}
    </Card>
  );
};
