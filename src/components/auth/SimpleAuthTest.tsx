
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const SimpleAuthTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicConnection = async () => {
    try {
      addLog('🔍 Testando conexão básica...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        addLog(`❌ Erro na conexão: ${error.message}`);
      } else {
        addLog(`✅ Conexão OK: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      addLog(`💥 Erro inesperado: ${error.message}`);
    }
  };

  const testSimpleSignUp = async () => {
    if (!email || !password) {
      addLog('❌ Email e senha são obrigatórios');
      return;
    }

    try {
      addLog(`📝 Testando cadastro simples para: ${email}`);
      
      // Teste super simples sem metadados
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      addLog(`📋 Resultado: ${JSON.stringify({ 
        hasUser: !!data.user, 
        hasSession: !!data.session,
        errorCode: error?.message || 'sem erro' 
      })}`);

      if (error) {
        addLog(`❌ Erro no cadastro: ${error.message}`);
      } else if (data.user) {
        addLog(`✅ Usuário criado: ${data.user.id}`);
      }
    } catch (error: any) {
      addLog(`💥 Erro inesperado: ${error.message}`);
    }
  };

  const testAuth = async () => {
    try {
      addLog('🔐 Verificando estado de autenticação...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        addLog(`✅ Usuário logado: ${user.email}`);
      } else {
        addLog('👤 Nenhum usuário logado');
      }
    } catch (error: any) {
      addLog(`💥 Erro ao verificar auth: ${error.message}`);
    }
  };

  const clearLogs = () => setTestResults([]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Teste de Autenticação</h1>
          <p className="text-slate-600 mt-2">Diagnóstico avançado</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="email">Email de teste</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teste@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha de teste</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123456"
              minLength={6}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={testBasicConnection} variant="outline">
            Testar Conexão
          </Button>
          <Button onClick={testAuth} variant="outline">
            Verificar Auth
          </Button>
          <Button onClick={testSimpleSignUp} className="col-span-2">
            Teste Cadastro Simples
          </Button>
          <Button onClick={clearLogs} variant="destructive" className="col-span-2">
            Limpar Logs
          </Button>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          <div className="text-gray-400 mb-2">Logs de diagnóstico:</div>
          {testResults.length === 0 ? (
            <div className="text-gray-500">Clique nos botões acima para executar testes...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
