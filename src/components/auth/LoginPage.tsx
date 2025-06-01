
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToastFeedback } from "@/hooks/useToastFeedback";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'owner' | 'employee'>('employee');
  const { showSuccess, showError, showInfo } = useToastFeedback();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          showError('Email não confirmado', 'Verifique sua caixa de entrada e clique no link de confirmação enviado por email. Se não recebeu, tente cadastrar-se novamente.');
        } else if (error.message.includes('Invalid login credentials')) {
          showError('Credenciais inválidas', 'Email ou senha incorretos. Verifique os dados e tente novamente.');
        } else {
          showError('Erro no login', error.message);
        }
        throw error;
      }

      if (data.user) {
        showSuccess('Login realizado', 'Bem-vindo ao sistema!');
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          showError('Usuário já cadastrado', 'Este email já está cadastrado. Tente fazer login ou recuperar a senha.');
        } else {
          showError('Erro no cadastro', error.message);
        }
        throw error;
      }

      if (data.user) {
        showSuccess('Conta criada', 'Verifique seu email para confirmar a conta antes de fazer login');
        setIsSignUp(false);
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      showError('Email necessário', 'Digite seu email para reenviar a confirmação');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        showError('Erro ao reenviar', error.message);
      } else {
        showSuccess('Email reenviado', 'Verifique sua caixa de entrada para o novo link de confirmação');
      }
    } catch (error: any) {
      showError('Erro ao reenviar', 'Não foi possível reenviar o email de confirmação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Sistema Financeiro</h1>
          <p className="text-slate-600 mt-2">
            {isSignUp ? 'Criar nova conta' : 'Faça login para continuar'}
          </p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Tipo de conta</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as 'owner' | 'employee')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="company" />
                    <Label htmlFor="company" className="text-sm">
                      Empresa (Proprietário)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employee" id="employee" />
                    <Label htmlFor="employee" className="text-sm">
                      Funcionário
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500 mt-1">
                  {role === 'owner' 
                    ? 'Como empresa, você terá acesso completo ao sistema'
                    : 'Como funcionário, você poderá lançar despesas e visualizar relatórios'
                  }
                </p>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
          
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="text-gray-600 hover:text-gray-700 text-sm"
                disabled={isLoading}
              >
                Reenviar email de confirmação
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Após se cadastrar, você deve confirmar seu email antes de fazer login. 
            Verifique sua caixa de entrada (e spam) para o link de confirmação.
          </p>
        </div>
      </Card>
    </div>
  );
};
