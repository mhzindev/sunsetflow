
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionManager } from "@/components/transactions/TransactionManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { CashFlow } from "@/components/cashflow/CashFlow";
import { Reports } from "@/components/reports/Reports";
import { ExpenseManager } from "@/components/expenses/ExpenseManager";
import { Settings } from "@/components/settings/Settings";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { Toaster } from "@/components/ui/sonner";

export type PageSection = 'dashboard' | 'transactions' | 'payments' | 'expenses' | 'cashflow' | 'reports' | 'settings';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<PageSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (section: string) => {
    setActiveSection(section as PageSection);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'transactions':
        return <TransactionManager />;
      case 'payments':
        return <PaymentManager />;
      case 'expenses':
        return <ExpenseManager />;
      case 'cashflow':
        return <CashFlow />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <TopBar 
            activeSection={activeSection}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </FinancialProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
};

export default Index;
