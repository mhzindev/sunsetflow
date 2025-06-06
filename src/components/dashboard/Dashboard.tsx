
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FinancialSummaryDebug } from './FinancialSummaryDebug';
import { RevenueManager } from "@/components/revenues/RevenueManager";
import { ProviderDashboard } from "@/components/providers/ProviderDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'admin' || profile?.user_type === 'admin';
  const isProvider = profile?.user_type === 'provider';

  // Se for prestador, mostrar dashboard específico para prestadores
  if (isProvider) {
    return <ProviderDashboard />;
  }

  // Dashboard completo para donos da empresa
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Financeiro</h1>
        {isOwner && (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg">
            Visão completa da empresa
          </div>
        )}
      </div>
      
      <FinancialSummary />
      
      {/* Componente temporário de debug - remover em produção */}
      <FinancialSummaryDebug />
      
      {/* Adicionar gerenciador de receitas */}
      <RevenueManager />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />
        <RecentTransactions />
      </div>
      
      <QuickActions onNavigate={onNavigate} />
    </div>
  );
};
