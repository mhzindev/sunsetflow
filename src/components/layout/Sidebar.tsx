import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Building2,
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Wallet
} from "lucide-react";
import type { PageSection } from "@/pages/Index";

interface SidebarProps {
  activeSection: PageSection;
  setActiveSection: (section: PageSection) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar = ({ activeSection, setActiveSection, isOpen, setIsOpen }: SidebarProps) => {
  const { signOut } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as PageSection,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral'
    },
    {
      id: 'transactions' as PageSection,
      label: 'Transações',
      icon: ArrowRightLeft,
      description: 'Entradas e saídas'
    },
    {
      id: 'payments' as PageSection,
      label: 'Pagamentos',
      icon: CreditCard,
      description: 'Contas a pagar'
    },
    {
      id: 'expenses' as PageSection,
      label: 'Despesas de Viagem',
      icon: Receipt,
      description: 'Reembolsos'
    },
    {
      id: 'cashflow' as PageSection,
      label: 'Fluxo de Caixa',
      icon: TrendingUp,
      description: 'Projeções'
    },
    {
      id: 'accounts' as PageSection,
      label: 'Minhas Contas',
      icon: Wallet,
      description: 'Contas e cartões'
    },
    {
      id: 'reports' as PageSection,
      label: 'Relatórios',
      icon: FileText,
      description: 'Análises'
    },
    {
      id: 'settings' as PageSection,
      label: 'Configurações',
      icon: Settings,
      description: 'Sistema'
    }
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Sunsettrack</h1>
                <p className="text-xs text-slate-600">Gestão Financeira</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    isOpen ? "px-3 py-2" : "px-2 py-2",
                    !isOpen && "justify-center",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  )}
                  onClick={() => setActiveSection(item.id)}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className={cn(
                    "flex-shrink-0",
                    isOpen ? "w-5 h-5 mr-3" : "w-5 h-5"
                  )} />
                  {isOpen && (
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{item.label}</span>
                      <span className={cn(
                        "text-xs opacity-75",
                        isActive ? "text-blue-100" : "text-slate-500"
                      )}>
                        {item.description}
                      </span>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-slate-200">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors",
              isOpen ? "justify-start px-3 py-2" : "justify-center px-2 py-2"
            )}
            onClick={handleLogout}
            title={!isOpen ? "Sair" : undefined}
          >
            <LogOut className={cn(
              "flex-shrink-0",
              isOpen ? "w-5 h-5 mr-3" : "w-5 h-5"
            )} />
            {isOpen && <span>Sair</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};
