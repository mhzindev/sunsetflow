
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TransactionManager } from "@/components/transactions/TransactionManager";
import { PaymentManager } from "@/components/payments/PaymentManager";
import { CashFlow } from "@/components/cashflow/CashFlow";
import { Reports } from "@/components/reports/Reports";

export type PageSection = 'dashboard' | 'transactions' | 'payments' | 'cashflow' | 'reports';

const Index = () => {
  const [activeSection, setActiveSection] = useState<PageSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionManager />;
      case 'payments':
        return <PaymentManager />;
      case 'cashflow':
        return <CashFlow />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
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
