
import { QuickActions } from "./QuickActions";
import { RecentTransactions } from "./RecentTransactions";
import { CashFlowChart } from "./CashFlowChart";
import { FinancialSummaryComplete } from "./FinancialSummaryComplete";
import { RLSStatusIndicator } from "./RLSStatusIndicator";
import { PendingRevenuesCard } from "./PendingRevenuesCard";
import { useCompanyIsolationOptimized } from "@/hooks/useCompanyIsolationOptimized";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Crown } from "lucide-react";
import { getAuthCache, isValidProfile } from '@/utils/authCache';
import { getUserAccessLevel } from "@/utils/companyUtils";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const DashboardOptimized = ({ onNavigate }: DashboardProps) => {
  const { isValidated, hasCompanyAccess, isCompanyOwner, accessLevel, loading: isolationLoading } = useCompanyIsolationOptimized();
  const { profile, loading: authLoading } = useAuth();

  // Usar cache se necessário
  let effectiveProfile = profile;
  if (!profile && !authLoading) {
    const cache = getAuthCache();
    if (cache?.profile && isValidProfile(cache.profile)) {
      effectiveProfile = cache.profile;
    }
  }

  const effectiveAccessLevel = effectiveProfile ? getUserAccessLevel(effectiveProfile) : 'none';
  const effectiveIsOwner = effectiveProfile?.role === 'admin' || effectiveProfile?.user_type === 'admin';

  console.log('📊 DashboardOptimized: Estado atual:', {
    profile: !!effectiveProfile,
    authLoading,
    isolationLoading,
    isValidated,
    hasCompanyAccess,
    isCompanyOwner,
    accessLevel,
    effectiveAccessLevel,
    effectiveIsOwner
  });

  if (authLoading || isolationLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando dados da empresa...</span>
        </div>
      </div>
    );
  }

  if (!hasCompanyAccess && !isValidated && effectiveAccessLevel === 'none') {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <Building2 className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Acesso Restrito:</strong> Sua conta não está associada a nenhuma empresa. 
            <span className="block mt-2">
              Se você acabou de se cadastrar, aguarde alguns segundos e recarregue a página. 
              Caso o problema persista, entre em contato com o administrador do sistema.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Dashboard Financeiro</h2>
            <p className="text-slate-600">
              Visão completa da empresa com isolamento automático de dados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {(isCompanyOwner || effectiveIsOwner) && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <Crown className="w-4 h-4 mr-1" />
                Administrador
              </div>
            )}
            {(effectiveProfile?.company_id || profile?.company_id) && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <Building2 className="w-4 h-4 mr-1" />
                Empresa Ativa
              </div>
            )}
          </div>
        </div>
      </div>

      <RLSStatusIndicator />

      <FinancialSummaryComplete />

      {(isCompanyOwner || effectiveIsOwner) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <PendingRevenuesCard onNavigate={onNavigate} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div>
          <QuickActions onNavigate={onNavigate} />
        </div>
      </div>

      <RecentTransactions onViewAll={() => onNavigate('transactions')} />
    </div>
  );
};
