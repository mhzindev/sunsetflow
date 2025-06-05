
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
      console.log('Email original:', accessCodeForm.email);
      console.log('Código original:', accessCodeForm.accessCode);

      // Normalizar dados de entrada
      const cleanEmail = accessCodeForm.email.trim().toLowerCase();
      const cleanCode = accessCodeForm.accessCode.trim().toUpperCase();

      console.log('Email normalizado:', cleanEmail);
      console.log('Código normalizado:', cleanCode);

      // 1. Primeiro tentar buscar prestador de serviço
      console.log('=== ETAPA 1: Buscando prestador de serviço ===');
      const { data: providerData, error: providerError } = await supabase.rpc('admin_find_service_provider_access', {
        search_email: cleanEmail,
        search_code: cleanCode
      });

      console.log('Resultado busca prestador:', providerData);
      console.log('Erro busca prestador:', providerError);

      let accessRecord = null;
      let userType = null;

      if (!providerError && providerData && providerData.length > 0) {
        accessRecord = providerData[0];
        userType = 'provider';
        console.log('Prestador encontrado:', accessRecord);
      } else {
        // 2. Se não encontrar prestador, tentar funcionário
        console.log('=== ETAPA 2: Buscando funcionário ===');
        const { data: employeeData, error: employeeError } = await supabase.rpc('admin_find_employee_access', {
          search_email: cleanEmail,
          search_code: cleanCode
        });

        console.log('Resultado busca funcionário:', employeeData);
        console.log('Erro busca funcionário:', employeeError);

        if (!employeeError && employeeData && employeeData.length > 0) {
          accessRecord = employeeData[0];
          userType = 'employee';
          console.log('Funcionário encontrado:', accessRecord);
        }
      }

      if (!accessRecord) {
        console.log('=== CÓDIGO NÃO ENCONTRADO ===');
        toast({
          title: "Código inválido",
          description: "Código de acesso não encontrado. Verifique o email e código informados.",
          variant: "destructive"
        });
        return;
      }

      // 3. Verificações específicas por tipo
      if (userType === 'provider') {
        if (!accessRecord.is_active) {
          console.log('=== PRESTADOR INATIVO ===');
          toast({
            title: "Acesso inativo",
            description: "Este código de acesso foi desativado. Entre em contato com o administrador.",
            variant: "destructive"
          });
          return;
        }
      } else if (userType === 'employee') {
        if (accessRecord.is_used) {
          console.log('=== CÓDIGO DE FUNCIONÁRIO JÁ FOI USADO ===');
          toast({
            title: "Código já utilizado",
            description: "Este código de acesso já foi utilizado. Entre em contato com o administrador.",
            variant: "destructive"
          });
          return;
        }

        if (accessRecord.expires_at && new Date(accessRecord.expires_at) < new Date()) {
          console.log('=== CÓDIGO DE FUNCIONÁRIO EXPIRADO ===');
          toast({
            title: "Código expirado",
            description: "Este código de acesso já expirou. Entre em contato com o administrador.",
            variant: "destructive"
          });
          return;
        }
      }

      console.log('=== CÓDIGO VÁLIDO, INICIANDO AUTENTICAÇÃO ===');

      // 4. Tentar autenticação
      let authSuccess = false;
      let authError = null;
      let authResult = null;

      // Para prestadores, usar o password_hash decodificado
      let password = cleanCode;
      if (userType === 'provider' && accessRecord.password_hash) {
        try {
          password = atob(accessRecord.password_hash);
          console.log('Senha decodificada para prestador');
        } catch (e) {
          console.log('Erro ao decodificar senha, usando código como senha');
          password = cleanCode;
        }
      }

      // Primeiro tentar login (usuário já existe)
      console.log('Tentando login primeiro...');
      const loginResult = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      console.log('Resultado do login:', loginResult);

      if (loginResult.error) {
        // Se login falhou, tentar criar conta
        console.log('Login falhou, tentando criar conta...');
        const signupResult = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              name: userType === 'provider' ? 'Prestador de Serviço' : accessRecord.employee_name,
              access_code: cleanCode,
              user_type: userType
            }
          }
        });

        console.log('Resultado do signup:', signupResult);

        if (signupResult.error) {
          authError = signupResult.error;
          console.error('Erro no signup:', signupResult.error);
        } else {
          authSuccess = true;
          authResult = signupResult;
        }
      } else {
        authSuccess = true;
        authResult = loginResult;
      }

      if (!authSuccess) {
        toast({
          title: "Erro de autenticação",
          description: `Erro ao processar login: ${authError?.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('=== AUTENTICAÇÃO BEM-SUCEDIDA ===');

      // 5. Aguardar um pouco para garantir que o usuário foi criado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 6. Atualizar/Criar perfil específico baseado no tipo
      if (authResult?.data?.user) {
        console.log('Criando/atualizando perfil do usuário...');
        
        if (userType === 'provider') {
          // Buscar dados do prestador para associar à empresa
          const { data: providerInfo } = await supabase
            .from('service_providers')
            .select('*')
            .eq('id', accessRecord.provider_id)
            .single();

          const profileData = {
            id: authResult.data.user.id,
            email: cleanEmail,
            name: providerInfo?.name || 'Prestador de Serviço',
            role: 'user' as const,
            user_type: 'provider' as const,
            provider_id: accessRecord.provider_id,
            company_id: null, // Prestadores não estão associados diretamente à empresa
            active: true
          };

          console.log('Dados do perfil do prestador:', profileData);

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

          if (profileError) {
            console.error('Erro ao criar/atualizar perfil do prestador:', profileError);
          } else {
            console.log('Perfil do prestador criado/atualizado com sucesso');
          }
        } else if (userType === 'employee') {
          const profileData = {
            id: authResult.data.user.id,
            email: cleanEmail,
            name: accessRecord.employee_name,
            role: 'user' as const,
            user_type: 'user' as const,
            company_id: accessRecord.company_id,
            active: true
          };

          console.log('Dados do perfil do funcionário:', profileData);

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

          if (profileError) {
            console.error('Erro ao criar/atualizar perfil do funcionário:', profileError);
          } else {
            console.log('Perfil do funcionário criado/atualizado com sucesso');
          }
        }
      }

      // 7. Atualizar registros conforme o tipo
      if (userType === 'employee') {
        console.log('Marcando código de funcionário como usado...');
        const { error: updateError } = await supabase
          .from('employee_access_codes')
          .update({ 
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('id', accessRecord.id);

        if (updateError) {
          console.error('Erro ao marcar código como usado:', updateError);
        } else {
          console.log('Código de funcionário marcado como usado com sucesso');
        }
      } else if (userType === 'provider') {
        console.log('Atualizando último login do prestador...');
        const { error: updateError } = await supabase
          .from('service_provider_access')
          .update({ 
            last_login: new Date().toISOString()
          })
          .eq('id', accessRecord.id);

        if (updateError) {
          console.error('Erro ao atualizar último login:', updateError);
        } else {
          console.log('Último login do prestador atualizado com sucesso');
        }
      }

      const userName = userType === 'provider' ? 'Prestador' : accessRecord.employee_name;
      toast({
        title: "Login realizado",
        description: `Bem-vindo ao Sunsettrack, ${userName}!`
      });

      // Limpar formulário
      setAccessCodeForm({
        email: '',
        accessCode: ''
      });

      navigate('/');
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
