
import { Button } from "@/components/ui/button";
import { PageSection } from "@/pages/Index";

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
  reports: 'Relatórios'
};

export const TopBar = ({ activeSection, sidebarOpen, setSidebarOpen }: TopBarProps) => {
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
            {sectionTitles[activeSection]}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-slate-600">Saldo Atual</p>
            <p className="font-bold text-lg text-slate-800">R$ 45.720,00</p>
          </div>
          
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 font-medium text-sm">ST</span>
          </div>
        </div>
      </div>
    </header>
  );
};
