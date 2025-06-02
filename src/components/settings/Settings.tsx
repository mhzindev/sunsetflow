
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from './AccountSettings';
import { CompanySettings } from './CompanySettings';
import { UserManagement } from './UserManagement';
import { ProviderManagement } from '@/components/providers/ProviderManagement';
import { User, Building2, Users, Briefcase, HelpCircle } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Configurações do Sistema
        </h3>
        <p className="text-slate-600 mb-6">
          Gerencie todas as configurações do sistema, dados pessoais, empresa e prestadores.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Prestadores
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Ajuda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="company" className="mt-6">
            <CompanySettings />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="providers" className="mt-6">
            <ProviderManagement />
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Acesso de Funcionário para Prestadores</h4>
              
              <div className="space-y-6">
                <div>
                  <h5 className="font-medium mb-2">Como dar acesso aos prestadores:</h5>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-4">
                    <li>Acesse a aba "Prestadores" nesta seção de configurações</li>
                    <li>Encontre o prestador na lista ou cadastre um novo</li>
                    <li>Clique em "Gerenciar Acesso" ao lado do nome do prestador</li>
                    <li>Preencha o email de acesso e defina uma senha temporária</li>
                    <li>Configure as permissões (visualizar missões, criar despesas, etc.)</li>
                    <li>Um código de acesso será gerado automaticamente</li>
                    <li>Envie o código de acesso e as credenciais para o prestador</li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">Importante:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 ml-4">
                    <li>Os códigos de acesso expiram em 7 dias se não utilizados</li>
                    <li>Cada prestador pode ter apenas um acesso ativo por vez</li>
                    <li>Você pode revogar o acesso a qualquer momento</li>
                    <li>Os prestadores só podem acessar dados relacionados às suas missões</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">Dicas de Segurança:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 ml-4">
                    <li>Use senhas fortes para os acessos dos prestadores</li>
                    <li>Revise periodicamente os acessos ativos</li>
                    <li>Oriente os prestadores a mudarem a senha no primeiro acesso</li>
                    <li>Monitore as atividades dos prestadores através dos logs do sistema</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Suporte:</h5>
                  <p className="text-sm text-gray-600">
                    Em caso de dúvidas ou problemas, entre em contato com o suporte técnico 
                    através do email: <strong>suporte@sunsettrack.com</strong>
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
