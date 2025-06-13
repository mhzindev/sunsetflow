
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialProviderSimplified } from '@/contexts/FinancialContextSimplified';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { DashboardSecure } from '@/components/dashboard/DashboardSecure';
import { TransactionManager } from '@/components/transactions/TransactionManager';
import { ExpenseManager } from '@/components/expenses/ExpenseManager';
import { PaymentListSecure } from '@/components/payments/PaymentListSecure';
import { AccountsManager } from '@/components/accounts/AccountsManager';
import { ProviderManagementSecure } from '@/components/providers/ProviderManagementSecure';
import { Reports } from '@/components/reports/Reports';
import { Settings } from '@/components/settings/Settings';
import { RevenueManager } from '@/components/revenues/RevenueManager';
import { PendingRevenuesManager } from '@/components/revenues/PendingRevenuesManager';
import { ConfirmedRevenuesManager } from '@/components/revenues/ConfirmedRevenuesManager';
import { CashFlow } from '@/components/cashflow/CashFlow';

const IndexSimplified = () => {
  const { user, profile, loading } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  console.log('IndexSimplified rendering with secure components:', { user: !!user, profile: !!profile, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900">Carregando Sistema Seguro...</h2>
          <p className="text-gray-600">Inicializando isolamento de dados</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('IndexSimplified: Usuário não encontrado, não deveria estar aqui');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Erro de Autenticação</h2>
          <p className="text-gray-600">Por favor, faça login novamente</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardSecure onNavigate={setCurrentSection} />;
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
        return <PaymentListSecure />;
      case 'accounts':
        return <AccountsManager />;
      case 'providers':
        return <ProviderManagementSecure />;
      case 'cashflow':
        return <CashFlow />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardSecure onNavigate={setCurrentSection} />;
    }
  };

  return (
    <FinancialProviderSimplified>
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
    </FinancialProviderSimplified>
  );
};

export default IndexSimplified;
