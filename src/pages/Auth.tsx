
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
      console.log('Iniciando login com código de acesso:', {
        email: accessCodeForm.email,
        code: accessCodeForm.accessCode
      });

      // Verificar se o código existe e está válido
      const { data: codeData, error: codeError } = await supabase
        .from('employee_access_codes')
        .select('*')
        .eq('code', accessCodeForm.accessCode)
        .eq('employee_email', accessCodeForm.email)
        .eq('is_used', false)
        .maybeSingle();

      console.log('Resultado da verificação do código:', { codeData, codeError });

      if (codeError) {
        console.error('Erro ao verificar código:', codeError);
        toast({
          title: "Erro",
          description: "Erro ao verificar código de acesso",
          variant: "destructive"
        });
        return;
      }

      if (!codeData) {
        toast({
          title: "Código inválido",
          description: "Código de acesso não encontrado, já utilizado ou email incorreto",
          variant: "destructive"
        });
        return;
      }

      // Verificar se o código não expirou
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        toast({
          title: "Código expirado",
          description: "Este código de acesso já expirou",
          variant: "destructive"
        });
        return;
      }

      console.log('Código válido, tentando criar/logar usuário');

      // Tentar fazer signup primeiro
      const signupResult = await supabase.auth.signUp({
        email: accessCodeForm.email,
        password: accessCodeForm.accessCode, // Usar o código como senha
        options: {
          data: {
            name: codeData.employee_name
          }
        }
      });

      console.log('Resultado do signup:', signupResult);

      if (signupResult.error) {
        // Se o erro indica que o usuário já existe, tentar fazer login
        if (signupResult.error.message.includes('already') || signupResult.error.message.includes('registered')) {
          console.log('Usuário já existe, tentando fazer login...');
          
          const signInResult = await supabase.auth.signInWithPassword({
            email: accessCodeForm.email,
            password: accessCodeForm.accessCode
          });

          console.log('Resultado do login:', signInResult);

          if (signInResult.error) {
            toast({
              title: "Erro de autenticação",
              description: "Erro ao fazer login. Verifique se o código está correto.",
              variant: "destructive"
            });
            return;
          }
        } else {
          console.error('Erro no signup:', signupResult.error);
          toast({
            title: "Erro no cadastro",
            description: signupResult.error.message,
            variant: "destructive"
          });
          return;
        }
      }

      // Se chegou até aqui, o login foi bem-sucedido
      console.log('Autenticação bem-sucedida, marcando código como usado');

      // Marcar código como usado
      const { error: updateError } = await supabase
        .from('employee_access_codes')
        .update({ 
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('Erro ao marcar código como usado:', updateError);
      }

      // Usar função RPC para associar à empresa
      const { error: rpcError } = await supabase
        .rpc('use_access_code', { 
          access_code: accessCodeForm.accessCode 
        });

      if (rpcError) {
        console.error('Erro no RPC:', rpcError);
      }

      toast({
        title: "Login realizado",
        description: `Bem-vindo ao Sunsettrack, ${codeData.employee_name}!`
      });

      // Limpar formulário
      setAccessCodeForm({
        email: '',
        accessCode: ''
      });

      navigate('/');

    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro interno. Tente novamente.",
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
