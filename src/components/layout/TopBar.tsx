
import { Button } from "@/components/ui/button";
import { PageSection } from "@/pages/Index";
import { useFinancial } from "@/contexts/FinancialContext";
import { useAuth } from "@/components/auth/AuthContext";
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
  const { user, logout } = useAuth();

  const getSectionTitle = () => {
    if (activeSection === 'transactions' && user?.role === 'employee') {
      return 'Minhas Despesas';
    }
    if (activeSection === 'expenses' && user?.role === 'employee') {
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
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
              <p className="text-sm text-slate-600">Bem-vindo,</p>
              <p className="font-medium text-slate-800">{user?.name}</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
