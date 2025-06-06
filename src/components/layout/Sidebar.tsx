
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
      // Menus específicos para prestadores
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

  const handleMenuItemClick = (section: PageSection) => {
    setActiveSection(section);
    // Fechar sidebar em dispositivos móveis após seleção
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <aside className="w-80 h-full bg-white border-r border-slate-200 shadow-lg flex flex-col">
      {/* Header com botão de fechar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Sunsettrack</h1>
            <p className="text-xs text-slate-600">
              {profile?.user_type === 'provider' ? 'Prestador' : 'Gestão Financeira'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200 h-auto py-3 px-4",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                )}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{item.label}</span>
                  <span className={cn(
                    "text-xs opacity-75",
                    isActive ? "text-blue-100" : "text-slate-500"
                  )}>
                    {item.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors justify-start px-4 py-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>Sair</span>
        </Button>
      </div>
    </aside>
  );
};
