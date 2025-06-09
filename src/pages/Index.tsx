
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionManager } from "@/components/transactions/TransactionManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { CashFlow } from "@/components/cashflow/CashFlow";
import { AccountsManager } from "@/components/accounts/AccountsManager";
import { Reports } from "@/components/reports/Reports";
import { ExpenseManager } from "@/components/expenses/ExpenseManager";
import { Settings } from "@/components/settings/Settings";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialProvider } from "@/contexts/FinancialContext";

export type PageSection = 'dashboard' | 'transactions' | 'payments' | 'expenses' | 'cashflow' | 'accounts' | 'reports' | 'settings';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

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
      <IndexContent />
    </FinancialProvider>
  );
};

const IndexContent = () => {
  const { profile } = useAuth();
  const isProvider = profile?.user_type === 'provider';
  
  // Seção inicial baseada no tipo de usuário
  const getInitialSection = (): PageSection => {
    if (isProvider) {
      return 'expenses'; // Prestadores começam em "Minhas Despesas"
    }
    return 'dashboard'; // Outros usuários começam no Dashboard
  };

  const [activeSection, setActiveSection] = useState<PageSection>(getInitialSection());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Atualizar seção ativa quando o perfil mudar
  useEffect(() => {
    setActiveSection(getInitialSection());
  }, [profile?.user_type]);

  const handleNavigate = (section: string) => {
    const validSection = section as PageSection;
    
    // Verificar se o prestador está tentando acessar seções não permitidas
    if (isProvider && !['expenses', 'settings'].includes(validSection)) {
      console.warn('Prestador tentou acessar seção não permitida:', validSection);
      return; // Bloquear navegação
    }
    
    setActiveSection(validSection);
  };

  const renderContent = () => {
    // Verificação adicional de segurança no frontend
    if (isProvider && !['expenses', 'settings'].includes(activeSection)) {
      console.warn('Prestador em seção não permitida, redirecionando...');
      setActiveSection('expenses');
      return <ExpenseManager />;
    }

    switch (activeSection) {
      case 'dashboard':
        // Bloquear dashboard para prestadores
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <Dashboard onNavigate={handleNavigate} />;
      case 'transactions':
        // Bloquear transações para prestadores
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <TransactionManager />;
      case 'payments':
        // Bloquear pagamentos para prestadores
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <PaymentManager />;
      case 'expenses':
        return <ExpenseManager />;
      case 'cashflow':
        // Bloquear fluxo de caixa para prestadores
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <CashFlow />;
      case 'accounts':
        // Bloquear contas para prestadores
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <AccountsManager />;
      case 'reports':
        // Bloquear relatórios para prestadores
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        if (isProvider) {
          return <ExpenseManager />;
        }
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
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
  );
};

export default Index;
