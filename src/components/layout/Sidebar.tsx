
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  circle-dollar-sign as CircleDollarSign, 
  trending-up as TrendingUp, 
  wallet as Wallet, 
  receipt as Receipt, 
  file-text as FileText,
  settings as Settings
} from "lucide-react";
import { PageSection } from "@/pages/Index";

interface SidebarProps {
  activeSection: PageSection;
  setActiveSection: (section: PageSection) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar = ({ activeSection, setActiveSection, isOpen }: SidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard' as PageSection,
      label: 'Dashboard',
      icon: CircleDollarSign,
      color: 'text-blue-600'
    },
    {
      id: 'transactions' as PageSection,
      label: 'Transações',
      icon: Receipt,
      color: 'text-emerald-600'
    },
    {
      id: 'payments' as PageSection,
      label: 'Pagamentos',
      icon: Wallet,
      color: 'text-orange-600'
    },
    {
      id: 'cashflow' as PageSection,
      label: 'Fluxo de Caixa',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      id: 'reports' as PageSection,
      label: 'Relatórios',
      icon: FileText,
      color: 'text-indigo-600'
    }
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-40",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-lg">Sunsettrack</h1>
              <p className="text-xs text-slate-400">Gestão Financeira</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-800",
                    activeSection === item.id && "bg-slate-800 text-white",
                    !isOpen && "justify-center px-2"
                  )}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className={cn("h-5 w-5", item.color)} />
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
            !isOpen && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5 text-slate-400" />
          {isOpen && <span className="ml-3">Configurações</span>}
        </Button>
      </div>
    </aside>
  );
};
