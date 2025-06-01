
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettings } from "./CompanySettings";
import { UserManagement } from "./UserManagement";
import { AccountSettings } from "./AccountSettings";
import { useAuth } from "@/contexts/AuthContext";

export const Settings = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'owner') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Acesso Negado</h3>
        <p className="text-slate-600">Apenas proprietários podem acessar as configurações.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Configurações do Sistema</h3>
        <p className="text-slate-600 mb-6">
          Gerencie as configurações da sua empresa, dados de acesso e funcionários.
        </p>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="users">Funcionários</TabsTrigger>
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
        </Tabs>
      </Card>
    </div>
  );
};
