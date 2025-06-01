
import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { TransactionManager } from '@/components/transactions/TransactionManager';
import { ExpenseManager } from '@/components/expenses/ExpenseManager';
import { PaymentManager } from '@/components/payments/PaymentManager';
import { AccountsManager } from '@/components/accounts/AccountsManager';
import { MissionManager } from '@/components/expenses/MissionManager';
import { CashFlow } from '@/components/cashflow/CashFlow';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialProvider } from '@/contexts/FinancialContext';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { profile } = useAuth();

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    // Se é funcionário (role = 'user'), mostrar dashboard simplificado
    if (profile?.role === 'user') {
      switch (activeSection) {
        case 'dashboard':
          return <EmployeeDashboard />;
        case 'expenses':
          return <ExpenseManager />;
        case 'settings':
          return <Settings />;
        default:
          return <EmployeeDashboard />;
      }
    }

    // Se é admin, mostrar dashboard completo
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <FinancialSummary />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CashFlowChart />
              </div>
              <QuickActions onNavigate={handleNavigate} />
            </div>
            <RecentTransactions />
          </div>
        );
      case 'transactions':
        return <TransactionManager />;
      case 'expenses':
        return <ExpenseManager />;
      case 'payments':
        return <PaymentManager />;
      case 'accounts':
        return <AccountsManager />;
      case 'missions':
        return <MissionManager />;
      case 'cashflow':
        return <CashFlow />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="space-y-6">
            <FinancialSummary />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CashFlowChart />
              </div>
              <QuickActions onNavigate={handleNavigate} />
            </div>
            <RecentTransactions />
          </div>
        );
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          userRole={profile?.role || 'user'} 
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            activeSection={activeSection}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </FinancialProvider>
  );
};
