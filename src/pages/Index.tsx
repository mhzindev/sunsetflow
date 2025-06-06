import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import Auth from "./Auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionManager } from "@/components/transactions/TransactionManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { ExpenseManager } from "@/components/expenses/ExpenseManager";
import { CashFlow } from "@/components/cashflow/CashFlow";
import { Reports } from "@/components/reports/Reports";
import { Settings } from "@/components/settings/Settings";
import { AccountsManager } from "@/components/accounts/AccountsManager";

export type PageSection = 'dashboard' | 'transactions' | 'payments' | 'expenses' | 'cashflow' | 'reports' | 'settings' | 'accounts';

const IndexContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Começa fechado
  const [activeSection, setActiveSection] = useState<PageSection>('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleNavigate = (section: string) => {
    setActiveSection(section as PageSection);
    // Fechar sidebar automaticamente após navegação em mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
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
      case 'accounts':
        return <AccountsManager />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Sidebar overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar retrátil */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      </div>
      
      {/* Conteúdo principal - ocupa toda a tela */}
      <div className="flex-1 flex flex-col w-full">
        <TopBar 
          activeSection={activeSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <AuthProvider>
      <FinancialProvider>
        <IndexContent />
      </FinancialProvider>
    </AuthProvider>
  );
};

export default Index;
