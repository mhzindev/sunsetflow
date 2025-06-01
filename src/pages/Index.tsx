
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionManager } from "@/components/transactions/TransactionManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { CashFlow } from "@/components/cashflow/CashFlow";
import { Reports } from "@/components/reports/Reports";
import { ExpenseManager } from "@/components/expenses/ExpenseManager";
import { Settings } from "@/components/settings/Settings";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";

export type PageSection = 'dashboard' | 'transactions' | 'payments' | 'expenses' | 'cashflow' | 'reports' | 'settings';

const IndexContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<PageSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Carregando...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will handle this
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
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
