
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Building2, User, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const { signUp, signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Company signup form state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Employee signup form state
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accessCode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signIn(loginForm.email, loginForm.password);

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao Sunsettrack!"
      });
      navigate('/');
    }
  };

  const handleCompanySignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyForm.name || !companyForm.email || !companyForm.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (companyForm.password !== companyForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signUp(companyForm.email, companyForm.password, {
      name: companyForm.name,
      role: 'owner'
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar a conta"
      });
      navigate('/');
    }
  };

  const handleEmployeeSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeForm.name || !employeeForm.email || !employeeForm.password || !employeeForm.accessCode) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (employeeForm.password !== employeeForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signUp(employeeForm.email, employeeForm.password, {
      name: employeeForm.name,
      role: 'employee',
      access_code: employeeForm.accessCode
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado",
        description: "Bem-vindo à equipe!"
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Sunsettrack
          </CardTitle>
          <p className="text-slate-600">Sistema de Gestão Financeira</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="company">Empresa</TabsTrigger>
              <TabsTrigger value="employee">Funcionário</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="company" className="mt-6">
              <form onSubmit={handleCompanySignup} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Cadastro de Empresa</span>
                </div>
                <div>
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                    placeholder="Nome da sua empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">E-mail</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="company-password">Senha</Label>
                  <Input
                    id="company-password"
                    type="password"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm({...companyForm, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="company-confirm-password">Confirmar Senha</Label>
                  <Input
                    id="company-confirm-password"
                    type="password"
                    value={companyForm.confirmPassword}
                    onChange={(e) => setCompanyForm({...companyForm, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Cadastrar Empresa
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="employee" className="mt-6">
              <form onSubmit={handleEmployeeSignup} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-slate-600">Cadastro de Funcionário</span>
                </div>
                <div>
                  <Label htmlFor="employee-code">Código de Acesso</Label>
                  <Input
                    id="employee-code"
                    value={employeeForm.accessCode}
                    onChange={(e) => setEmployeeForm({...employeeForm, accessCode: e.target.value})}
                    placeholder="STRACK-2024-XXXXXX"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Solicite o código com o responsável da empresa
                  </p>
                </div>
                <div>
                  <Label htmlFor="employee-name">Nome Completo</Label>
                  <Input
                    id="employee-name"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="employee-email">E-mail</Label>
                  <Input
                    id="employee-email"
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="employee-password">Senha</Label>
                  <Input
                    id="employee-password"
                    type="password"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="employee-confirm-password">Confirmar Senha</Label>
                  <Input
                    id="employee-confirm-password"
                    type="password"
                    value={employeeForm.confirmPassword}
                    onChange={(e) => setEmployeeForm({...employeeForm, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Cadastrar Funcionário
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
