
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Users, Plus, Key, Copy, Eye, EyeOff, Trash2, UserPlus, ToggleLeft, ToggleRight } from "lucide-react";
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement";
import { useAuth } from "@/contexts/AuthContext";

export const UserManagement = () => {
  const { profile } = useAuth();
  const { 
    employees, 
    accessCodes, 
    loading, 
    createAccessCode,
    toggleAccessCode,
    deleteAccessCode, 
    deactivateEmployee, 
    copyToClipboard 
  } = useEmployeeManagement();
  
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showAccessCodes, setShowAccessCodes] = useState(false);
  
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleCreateAccessCode = async () => {
    if (!newUserForm.name || !newUserForm.email) {
      return;
    }

    await createAccessCode(newUserForm.name, newUserForm.email);
    setNewUserForm({ name: '', email: '', phone: '' });
    setShowNewUserDialog(false);
  };

  const handleDeactivateEmployee = async (employeeId: string, employeeName: string) => {
    if (window.confirm(`Tem certeza que deseja desativar ${employeeName}?`)) {
      await deactivateEmployee(employeeId);
    }
  };

  const handleToggleAccessCode = async (codeId: string, currentStatus: boolean) => {
    await toggleAccessCode(codeId, currentStatus);
  };

  const handleDeleteAccessCode = async (codeId: string, employeeName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o código de acesso de ${employeeName}?`)) {
      await deleteAccessCode(codeId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando dados dos usuários...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Apenas admins podem gerenciar usuários
  if (profile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Acesso Restrito</h3>
              <p className="text-slate-600">
                Apenas administradores podem gerenciar usuários.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionários Ativos ({employees.length})
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
                    <Button 
                      onClick={handleCreateAccessCode} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!newUserForm.name || !newUserForm.email}
                    >
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
          {employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum funcionário encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
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
                      <Badge variant={employee.role === 'admin' ? "default" : "secondary"}>
                        {employee.role === 'admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.active ? "default" : "secondary"}>
                        {employee.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateEmployee(employee.id, employee.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Códigos de Acesso ({accessCodes.length})
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
                  <li>Use os botões abaixo para gerenciar os códigos (ativar/desativar/excluir)</li>
                </ol>
              </div>
              
              {accessCodes.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhum código de acesso encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Expira em</TableHead>
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
                            {code.isUsed ? "Usado/Inativo" : "Ativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(code.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          {code.expires_at ? new Date(code.expires_at).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(code.code)}
                              title="Copiar código"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAccessCode(code.id, code.isUsed)}
                              title={code.isUsed ? "Ativar código" : "Desativar código"}
                              className={code.isUsed ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}
                            >
                              {code.isUsed ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAccessCode(code.id, code.employeeName)}
                              title="Excluir código"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
