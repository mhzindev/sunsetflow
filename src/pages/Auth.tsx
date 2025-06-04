
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Key } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { signUp, signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [accessCodeLoading, setAccessCodeLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Access code form state
  const [accessCodeForm, setAccessCodeForm] = useState({
    email: '',
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    if (signupForm.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.name);

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar a conta ou faça login diretamente"
      });
      // Limpar formulário após sucesso
      setSignupForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  const handleAccessCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCodeForm.email || !accessCodeForm.accessCode) {
      toast({
        title: "Erro",
        description: "Email e código de acesso são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setAccessCodeLoading(true);

    try {
      console.log('=== INÍCIO DO LOGIN COM CÓDIGO DE ACESSO ===');
      console.log('Email:', accessCodeForm.email);
      console.log('Código:', accessCodeForm.accessCode);

      // Limpar espaços e normalizar dados
      const cleanEmail = accessCodeForm.email.trim().toLowerCase();
      const cleanCode = accessCodeForm.accessCode.trim().toUpperCase();

      console.log('Email limpo:', cleanEmail);
      console.log('Código limpo:', cleanCode);

      // 1. Verificar se o código existe (usando consulta mais simples)
      console.log('=== ETAPA 1: Verificando se código existe ===');
      const { data: allCodes, error: allCodesError } = await supabase
        .from('employee_access_codes')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Todos os códigos no banco:', allCodes);
      console.log('Erro ao buscar todos códigos:', allCodesError);

      // 2. Buscar código específico sem filtros RLS
      console.log('=== ETAPA 2: Buscando código específico ===');
      const { data: codeData, error: codeError } = await supabase
        .from('employee_access_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('employee_email', cleanEmail);

      console.log('Resultado da busca específica:', codeData);
      console.log('Erro da busca específica:', codeError);

      if (codeError) {
        console.error('Erro na consulta SQL:', codeError);
        toast({
          title: "Erro",
          description: `Erro na consulta: ${codeError.message}`,
          variant: "destructive"
        });
        return;
      }

      // 3. Verificar se código foi encontrado
      if (!codeData || codeData.length === 0) {
        console.log('=== CÓDIGO NÃO ENCONTRADO ===');
        
        // Buscar por código sem filtro de email para debug
        const { data: codeOnlyData } = await supabase
          .from('employee_access_codes')
          .select('*')
          .eq('code', cleanCode);

        console.log('Códigos com este código (qualquer email):', codeOnlyData);

        // Buscar por email sem filtro de código para debug
        const { data: emailOnlyData } = await supabase
          .from('employee_access_codes')
          .select('*')
          .eq('employee_email', cleanEmail);

        console.log('Códigos para este email:', emailOnlyData);

        toast({
          title: "Código inválido",
          description: "Código de acesso não encontrado ou email incorreto. Verifique os dados informados.",
          variant: "destructive"
        });
        return;
      }

      const accessCode = codeData[0];
      console.log('Código encontrado:', accessCode);

      // 4. Verificar se código já foi usado
      if (accessCode.is_used) {
        console.log('=== CÓDIGO JÁ FOI USADO ===');
        toast({
          title: "Código já utilizado",
          description: "Este código de acesso já foi utilizado. Entre em contato com o administrador.",
          variant: "destructive"
        });
        return;
      }

      // 5. Verificar se código expirou
      if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
        console.log('=== CÓDIGO EXPIRADO ===');
        toast({
          title: "Código expirado",
          description: "Este código de acesso já expirou. Entre em contato com o administrador.",
          variant: "destructive"
        });
        return;
      }

      console.log('=== CÓDIGO VÁLIDO, INICIANDO AUTENTICAÇÃO ===');

      // 6. Criar usuário ou fazer login
      // Primeiro, tentar criar conta nova
      console.log('Tentando criar nova conta...');
      const signupResult = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanCode, // Usar código como senha temporária
        options: {
          data: {
            name: accessCode.employee_name,
            access_code: cleanCode
          }
        }
      });

      console.log('Resultado do signup:', signupResult);

      let authSuccess = false;

      if (signupResult.error) {
        // Se usuário já existe, tentar fazer login
        if (signupResult.error.message.includes('already') || 
            signupResult.error.message.includes('registered') ||
            signupResult.error.message.includes('User already registered')) {
          
          console.log('Usuário já existe, tentando login...');
          const loginResult = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanCode
          });

          console.log('Resultado do login:', loginResult);

          if (loginResult.error) {
            console.error('Erro no login:', loginResult.error);
            toast({
              title: "Erro de autenticação",
              description: `Erro ao fazer login: ${loginResult.error.message}`,
              variant: "destructive"
            });
            return;
          }
          authSuccess = true;
        } else {
          console.error('Erro no signup:', signupResult.error);
          toast({
            title: "Erro no cadastro",
            description: `Erro ao criar conta: ${signupResult.error.message}`,
            variant: "destructive"
          });
          return;
        }
      } else {
        authSuccess = true;
      }

      if (authSuccess) {
        console.log('=== AUTENTICAÇÃO BEM-SUCEDIDA ===');

        // 7. Marcar código como usado
        console.log('Marcando código como usado...');
        const { error: updateError } = await supabase
          .from('employee_access_codes')
          .update({ 
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('id', accessCode.id);

        if (updateError) {
          console.error('Erro ao marcar código como usado:', updateError);
        } else {
          console.log('Código marcado como usado com sucesso');
        }

        // 8. Usar RPC para associar à empresa
        console.log('Associando usuário à empresa...');
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('use_access_code', { 
            access_code: cleanCode 
          });

        console.log('Resultado do RPC:', rpcResult);
        if (rpcError) {
          console.error('Erro no RPC:', rpcError);
        }

        toast({
          title: "Login realizado",
          description: `Bem-vindo ao Sunsettrack, ${accessCode.employee_name}!`
        });

        // Limpar formulário
        setAccessCodeForm({
          email: '',
          accessCode: ''
        });

        navigate('/');
      }

    } catch (error) {
      console.error('=== ERRO GERAL ===', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro interno. Tente novamente ou entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setAccessCodeLoading(false);
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
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="access-code">Código</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
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
                    required
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
                      required
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
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="access-code" className="mt-6">
              <form onSubmit={handleAccessCodeLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <Key className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Entre com o código de acesso fornecido pelo administrador
                  </p>
                </div>
                <div>
                  <Label htmlFor="access-email">E-mail</Label>
                  <Input
                    id="access-email"
                    type="email"
                    value={accessCodeForm.email}
                    onChange={(e) => setAccessCodeForm({...accessCodeForm, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="access-code">Código de Acesso</Label>
                  <Input
                    id="access-code"
                    value={accessCodeForm.accessCode}
                    onChange={(e) => setAccessCodeForm({...accessCodeForm, accessCode: e.target.value})}
                    placeholder="Digite o código fornecido"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={accessCodeLoading}>
                  {accessCodeLoading ? "Entrando..." : "Entrar com Código"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-600">
                    O primeiro usuário cadastrado se torna automaticamente o administrador
                  </p>
                </div>
                <div>
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
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
