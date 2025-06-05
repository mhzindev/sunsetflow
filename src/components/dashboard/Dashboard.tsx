
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FinancialSummaryDebug } from './FinancialSummaryDebug';
import { RevenueManager } from "@/components/revenues/RevenueManager";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'admin' || profile?.user_type === 'admin';
  const isProvider = profile?.user_type === 'provider';

  // Se for prestador, mostrar dashboard simplificado
  if (isProvider) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Meu Painel</h1>
        </div>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo, {profile.name}!</h2>
          <p className="text-slate-600 mb-4">
            Como prestador de serviços, você pode registrar suas despesas de viagem e acompanhar o status dos seus reembolsos.
          </p>
          <div className="text-sm text-blue-600">
            Acesse "Minhas Despesas" no menu lateral para gerenciar suas despesas.
          </div>
        </Card>

        <RecentTransactions />
      </div>
    );
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
