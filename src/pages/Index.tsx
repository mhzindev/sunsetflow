
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AccessCodeModal } from "@/components/auth/AccessCodeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Shield } from "lucide-react";

const Index = () => {
  const { user, loading, needsAccessCode, profile, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Sistema de Gestão Empresarial
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Gerencie transações, despesas, missões e muito mais em um só lugar
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/auth'}
              >
                Entrar
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/auth'}
              >
                Criar Conta
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Gestão Empresarial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Complete controle sobre as finanças e operações da sua empresa
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Equipe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Gerencie funcionários e suas permissões de forma simples
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Acompanhe o desempenho com relatórios detalhados
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Dados protegidos com as melhores práticas de segurança
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Como funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Cadastre-se</h3>
                <p className="text-slate-600">
                  Crie sua conta e configure sua empresa no sistema
                </p>
              </div>
              <div>
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Convide sua equipe</h3>
                <p className="text-slate-600">
                  Gere códigos de acesso para seus funcionários
                </p>
              </div>
              <div>
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Gerencie tudo</h3>
                <p className="text-slate-600">
                  Controle completo sobre finanças e operações
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard />
      <AccessCodeModal 
        open={needsAccessCode}
        onSuccess={refreshProfile}
        userEmail={user.email}
      />
    </>
  );
};

export default Index;
