
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
  const { signOut, profile } = useAuth();

  // Definir menus baseado no tipo de usuário
  const getMenuItems = () => {
    const isProvider = profile?.user_type === 'provider';
    
    if (isProvider) {
      // Menus específicos para prestadores - REMOVIDO O DASHBOARD
      return [
        {
          id: 'expenses' as PageSection,
          label: 'Minhas Despesas',
          icon: Receipt,
          description: 'Criar despesas'
        },
        {
          id: 'settings' as PageSection,
          label: 'Configurações',
          icon: Settings,
          description: 'Dados pessoais'
        }
      ];
    }

    // Menus completos para admins e usuários regulares
    return [
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
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await signOut();
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para mobile com clique fora */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOutsideClick}
        />
      )}
      
      {/* Botão do menu sanduíche */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md hover:bg-gray-100"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-lg lg:shadow-none",
        // Mobile: aparece/esconde completamente
        "lg:translate-x-0",
        isOpen 
          ? "translate-x-0 w-64" 
          : "-translate-x-full w-64 lg:w-16",
        // Desktop: sempre visível mas com largura variável
        "lg:relative lg:z-auto"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {(isOpen || window.innerWidth >= 1024) && (
            <div className={cn(
              "flex items-center space-x-3 transition-all duration-300",
              !isOpen && "lg:hidden"
            )}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              {isOpen && (
                <div>
                  <h1 className="font-bold text-slate-800">Sunsettrack</h1>
                  <p className="text-xs text-slate-600">
                    {profile?.user_type === 'provider' ? 'Prestador' : 'Gestão Financeira'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Botão de fechar apenas no desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex"
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
                    "w-full transition-all duration-200",
                    isOpen ? "justify-start px-3 py-2" : "justify-center px-2 py-2 lg:px-2",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  )}
                  onClick={() => {
                    setActiveSection(item.id);
                    // Fechar menu no mobile após seleção
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
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
              isOpen ? "justify-start px-3 py-2" : "justify-center px-2 py-2 lg:px-2"
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
