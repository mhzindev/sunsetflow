
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Key, Copy, Eye, EyeOff, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";

export const UserManagement = () => {
  const { toast } = useToast();
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showAccessCodes, setShowAccessCodes] = useState(false);
  
  // Mock data - em produção viria de um contexto ou API
  const [employees] = useState<Profile[]>([
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@sunsettrack.com',
      role: 'user',
      active: true,
      created_at: '2024-01-15',
      phone: '(11) 98765-4321'
    },
    {
      id: '3',
      name: 'João Oliveira',
      email: 'joao@sunsettrack.com',
      role: 'user',
      active: true,
      created_at: '2024-02-01',
      phone: '(11) 97654-3210'
    }
  ]);

  const [accessCodes] = useState([
    {
      id: '1',
      code: 'STRACK-2024-001',
      employeeName: 'Maria Silva',
      employeeEmail: 'maria@sunsettrack.com',
      isUsed: false,
      createdAt: '2024-03-01',
      expiresAt: '2024-03-08'
    },
    {
      id: '2',
      code: 'STRACK-2024-002',
      employeeName: 'Pedro Costa',
      employeeEmail: 'pedro@sunsettrack.com',
      isUsed: true,
      createdAt: '2024-02-20',
      usedAt: '2024-02-22'
    }
  ]);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const generateAccessCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `STRACK-${new Date().getFullYear()}-${timestamp}`;
  };

  const handleCreateAccessCode = () => {
    if (!newUserForm.name || !newUserForm.email) {
      toast({
        title: "Erro",
        description: "Nome e e-mail são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newCode = generateAccessCode();
    
    // Aqui seria a integração com o backend para criar o código
    toast({
      title: "Código de acesso criado",
      description: `Código ${newCode} criado para ${newUserForm.name}`,
    });
    
    setNewUserForm({ name: '', email: '', phone: '' });
    setShowNewUserDialog(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência.",
    });
  };

  const deactivateEmployee = (employeeId: string, employeeName: string) => {
    // Aqui seria a integração com o backend para desativar o funcionário
    toast({
      title: "Funcionário desativado",
      description: `${employeeName} foi desativado do sistema.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionários Ativos
            </div>
            <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Funcionário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Código de Acesso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employeeName">Nome do Funcionário</Label>
                    <Input
                      id="employeeName"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeEmail">E-mail</Label>
                    <Input
                      id="employeeEmail"
                      type="email"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                      placeholder="email@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeePhone">Telefone (opcional)</Label>
                    <Input
                      id="employeePhone"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateAccessCode} className="bg-green-600 hover:bg-green-700">
                      <Key className="w-4 h-4 mr-2" />
                      Gerar Código
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={employee.active ? "default" : "secondary"}>
                      {employee.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateEmployee(employee.id, employee.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Códigos de Acesso
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAccessCodes(!showAccessCodes)}
            >
              {showAccessCodes ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAccessCodes ? "Ocultar" : "Visualizar"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAccessCodes && (
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <h4 className="font-medium text-blue-900 mb-2">Como usar os códigos de acesso:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Compartilhe o código com o novo funcionário</li>
                  <li>O funcionário deve acessar o sistema e usar o código na tela de login</li>
                  <li>Após o primeiro uso, o código será invalidado automaticamente</li>
                  <li>Códigos não utilizados expiram em 7 dias</li>
                </ol>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono text-sm">{code.code}</TableCell>
                      <TableCell>{code.employeeName}</TableCell>
                      <TableCell>{code.employeeEmail}</TableCell>
                      <TableCell>
                        <Badge variant={code.isUsed ? "secondary" : "default"}>
                          {code.isUsed ? "Usado" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(code.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                          disabled={code.isUsed}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
