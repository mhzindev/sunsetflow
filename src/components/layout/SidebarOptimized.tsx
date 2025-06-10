
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Home, 
  CreditCard, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings, 
  FileText,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContextOptimized";
import { getUserAccessLevel } from "@/utils/companyUtils";
import { getAuthCache, isValidProfile } from '@/utils/authCache';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export const SidebarOptimized = ({ currentSection, onSectionChange }: SidebarProps) => {
  const { profile, loading } = useAuth();
  
  // Usar cache se profile não estiver disponível
  let effectiveProfile = profile;
  if (!profile && !loading) {
    const cache = getAuthCache();
    if (cache?.profile && isValidProfile(cache.profile)) {
      effectiveProfile = cache.profile;
    }
  }

  const accessLevel = getUserAccessLevel(effectiveProfile);
  const isOwner = effectiveProfile?.role === 'admin' || effectiveProfile?.user_type === 'admin';
  const isProvider = effectiveProfile?.user_type === 'provider';

  console.log('SidebarOptimized: Estado atual:', {
    profile: !!effectiveProfile,
    loading,
    accessLevel,
    isOwner,
    isProvider,
    role: effectiveProfile?.role,
    userType: effectiveProfile?.user_type
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, available: true },
    { id: 'transactions', label: 'Transações', icon: Receipt, available: true },
    { id: 'revenues', label: 'Receitas', icon: DollarSign, available: isOwner, children: [
      { id: 'revenues-pending', label: 'Pendentes', icon: Clock },
      { id: 'revenues-confirmed', label: 'Confirmadas', icon: CheckCircle }
    ]},
    { id: 'expenses', label: 'Despesas', icon: FileText, available: true },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard, available: isOwner },
    { id: 'accounts', label: 'Contas', icon: BarChart3, available: isOwner },
    { id: 'providers', label: 'Prestadores', icon: Users, available: isOwner },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, available: isOwner },
    { id: 'settings', label: 'Configurações', icon: Settings, available: true }
  ];

  const handleMenuClick = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    if (item && item.children) {
      onSectionChange(item.children[0].id);
    } else {
      onSectionChange(itemId);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-slate-800">
          Sistema Financeiro
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {loading ? 'Carregando...' : 
           isOwner ? 'Visão da Empresa' : 
           isProvider ? 'Prestador' : 
           accessLevel !== 'none' ? 'Usuário' : 'Verificando acesso...'}
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.filter(item => item.available).map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id || 
            (item.children && item.children.some(child => currentSection === child.id));
          
          return (
            <div key={item.id} className="space-y-1">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
              
              {item.children && isActive && (
                <div className="ml-4 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = currentSection === child.id;
                    
                    return (
                      <Button
                        key={child.id}
                        variant={isChildActive ? "default" : "ghost"}
                        size="sm"
                        className={`w-full justify-start ${
                          isChildActive ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        onClick={() => onSectionChange(child.id)}
                      >
                        <ChildIcon className="mr-2 h-3 w-3" />
                        {child.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-slate-500">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Isolamento Ativo</span>
          </div>
          <p>Dados isolados por empresa</p>
          {effectiveProfile && (
            <p className="mt-1 text-slate-400">
              ID: {effectiveProfile.company_id ? effectiveProfile.company_id.slice(0, 8) : 'N/A'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
