
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionManager } from "@/components/transactions/TransactionManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { CashFlow } from "@/components/cashflow/CashFlow";
import { Reports } from "@/components/reports/Reports";
import { ExpenseManager } from "@/components/expenses/ExpenseManager";
import { AuthProvider } from "@/components/auth/AuthContext";

export type PageSection = 'dashboard' | 'transactions' | 'payments' | 'expenses' | 'cashflow' | 'reports';

const Index = () => {
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
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default Index;
