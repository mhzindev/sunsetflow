
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FinancialSummaryDebug } from './FinancialSummaryDebug';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      </div>
      
      <FinancialSummary />
      
      {/* Componente temporário de debug */}
      <FinancialSummaryDebug />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />
        <RecentTransactions />
      </div>
      
      <QuickActions onNavigate={onNavigate} />
    </div>
  );
};
