
import { Card } from "@/components/ui/card";
import { FinancialSummary } from "./FinancialSummary";
import { RecentTransactions } from "./RecentTransactions";
import { CashFlowChart } from "./CashFlowChart";
import { QuickActions } from "./QuickActions";

interface DashboardProps {
  onNavigate?: (section: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <FinancialSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div>
          <QuickActions onNavigate={onNavigate || (() => {})} />
        </div>
      </div>

      <RecentTransactions />
    </div>
  );
};
