
import { QuickActions } from "./QuickActions";
import { RecentTransactions } from "./RecentTransactions";
import { CashFlowChart } from "./CashFlowChart";
import { FinancialSummarySecure } from "./FinancialSummarySecure";
import { useCompanyIsolation } from "@/hooks/useCompanyIsolation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { isValidated, hasCompanyAccess } = useCompanyIsolation();

  if (!hasCompanyAccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <strong>Acesso Restrito:</strong> Sua conta não está associada a nenhuma empresa. 
            Entre em contato com o administrador do sistema para obter acesso aos dados.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-600">
          Visão geral das suas finanças e atividades recentes
        </p>
      </div>

      <FinancialSummarySecure />

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
