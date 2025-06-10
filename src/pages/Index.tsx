
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialProvider } from '@/contexts/FinancialContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { TransactionManager } from '@/components/transactions/TransactionManager';
import { ExpenseManager } from '@/components/expenses/ExpenseManager';
import { PaymentManager } from '@/components/payments/PaymentManager';
import { AccountsManager } from '@/components/accounts/AccountsManager';
import { ProviderManagement } from '@/components/providers/ProviderManagement';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { RevenueManager } from '@/components/revenues/RevenueManager';
import { PendingRevenuesManager } from '@/components/revenues/PendingRevenuesManager';
import { ConfirmedRevenuesManager } from '@/components/revenues/ConfirmedRevenuesManager';
import { CashFlow } from '@/components/cashflow/CashFlow';

const Index = () => {
  const { user, profile } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Carregando...</h2>
          <p className="text-gray-600">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentSection} />;
      case 'transactions':
        return <TransactionManager />;
      case 'revenues':
      case 'revenues-pending':
        return <PendingRevenuesManager />;
      case 'revenues-confirmed':
        return <ConfirmedRevenuesManager />;
      case 'expenses':
        return <ExpenseManager />;
      case 'payments':
        return <PaymentManager />;
      case 'accounts':
        return <AccountsManager />;
      case 'providers':
        return <ProviderManagement />;
      case 'cashflow':
        return <CashFlow />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentSection} />;
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            activeSection={currentSection}
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

export default Index;
