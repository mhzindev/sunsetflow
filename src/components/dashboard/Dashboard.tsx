
import { QuickActions } from "./QuickActions";
import { RecentTransactions } from "./RecentTransactions";
import { CashFlowChart } from "./CashFlowChart";
import { FinancialSummaryComplete } from "./FinancialSummaryComplete";
import { RLSStatusIndicator } from "./RLSStatusIndicator";
import { PendingRevenuesCard } from "./PendingRevenuesCard";
import { useCompanyIsolation } from "@/hooks/useCompanyIsolation";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Building2, Crown } from "lucide-react";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { isValidated, hasCompanyAccess, isCompanyOwner, accessLevel } = useCompanyIsolation();
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!hasCompanyAccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Acesso Restrito:</strong> Sua conta não está associada a nenhuma empresa. 
            {accessLevel === 'none' && (
              <span className="block mt-2">
                Se você acabou de se cadastrar, aguarde alguns segundos e recarregue a página. 
                Caso o problema persista, entre em contato com o administrador do sistema.
              </span>
            )}
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
              Visão completa da empresa com isolamento total de dados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isCompanyOwner && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <Crown className="w-4 h-4 mr-1" />
                Administrador
              </div>
            )}
            {profile?.company_id && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <Building2 className="w-4 h-4 mr-1" />
                Empresa Ativa
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de Status RLS */}
      <RLSStatusIndicator />

      <FinancialSummaryComplete />

      {/* Adicionar card de receitas pendentes para donos */}
      {isCompanyOwner && (
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

      <RecentTransactions />
    </div>
  );
};
