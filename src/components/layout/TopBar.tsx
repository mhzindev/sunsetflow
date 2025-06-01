
import { Button } from "@/components/ui/button";
import { PageSection } from "@/pages/Index";
import { useFinancial } from "@/contexts/FinancialContext";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

interface TopBarProps {
  activeSection: PageSection;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const sectionTitles = {
  dashboard: 'Dashboard',
  transactions: 'Transações',
  payments: 'Pagamentos',
  expenses: 'Despesas de Viagem',
  cashflow: 'Fluxo de Caixa',
  reports: 'Relatórios',
  settings: 'Configurações'
};

export const TopBar = ({ activeSection, sidebarOpen, setSidebarOpen }: TopBarProps) => {
  const { data } = useFinancial();
  const { profile, signOut } = useAuth();

  const getSectionTitle = () => {
    if (activeSection === 'transactions' && profile?.role === 'user') {
      return 'Minhas Despesas';
    }
    if (activeSection === 'expenses' && profile?.role === 'user') {
      return 'Nova Despesa';
    }
    return sectionTitles[activeSection];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-slate-600"></div>
              <div className="w-full h-0.5 bg-slate-600"></div>
              <div className="w-full h-0.5 bg-slate-600"></div>
            </div>
          </Button>
          
          <h2 className="text-2xl font-bold text-slate-800">
            {getSectionTitle()}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Saldo Atual</p>
            <p className="font-bold text-lg text-slate-800">
              {formatCurrency(data.totalBalance)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{profile?.name}</p>
              <p className="text-xs text-slate-500">
                {profile?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
            
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-medium text-sm">
                {profile?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
