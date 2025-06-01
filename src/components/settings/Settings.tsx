
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./AccountSettings";
import { UserManagement } from "./UserManagement";
import { useAuth } from "@/contexts/AuthContext";

export const Settings = () => {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Acesso Limitado</h3>
        <p className="text-slate-600">
          Algumas configurações estão disponíveis apenas para administradores.
        </p>
        <div className="mt-6">
          <AccountSettings />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Configurações do Sistema</h3>
        <p className="text-slate-600 mb-6">
          Gerencie as configurações do sistema, sua conta e usuários.
        </p>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
