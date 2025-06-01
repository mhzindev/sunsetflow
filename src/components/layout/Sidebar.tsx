
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  Receipt, 
  CreditCard, 
  Wallet,
  MapPin,
  TrendingUp,
  FileText,
  Settings,
  Building2,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: 'admin' | 'user';
}

export const Sidebar = ({ activeSection, onSectionChange, userRole }: SidebarProps) => {
  const { signOut, profile } = useAuth();

  // Opções para administradores
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowUpDown },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'accounts', label: 'Contas', icon: Wallet },
    { id: 'missions', label: 'Missões', icon: MapPin },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Opções para funcionários
  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Minhas Despesas', icon: Receipt },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="bg-white w-64 shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="font-bold text-lg text-slate-800">
              FinanceApp
            </h2>
            <p className="text-xs text-slate-500">
              {userRole === 'admin' ? 'Administrador' : 'Funcionário'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-800">
            {profile?.name}
          </p>
          <p className="text-xs text-slate-500">
            {profile?.email}
          </p>
          {profile?.role === 'user' && (
            <p className="text-xs text-blue-600 mt-1">
              Funcionário
            </p>
          )}
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
};
