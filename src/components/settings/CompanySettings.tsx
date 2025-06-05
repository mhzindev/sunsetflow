import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, FileText, Plus } from "lucide-react";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/contexts/AuthContext";

export const CompanySettings = () => {
  const { profile } = useAuth();
  const { company, loading, createCompany, updateCompany } = useCompany();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    cnpj: '',
    email: '',
    phone: '',
    address: ''
  });

  // Sincronizar formData com os dados da empresa quando ela for carregada
  useEffect(() => {
    console.log('Company data changed:', company);
    if (company) {
      setFormData({
        name: company.name || '',
        legalName: company.legalName || '',
        cnpj: company.cnpj || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || ''
      });
    }
  }, [company]);

  const handleSave = async () => {
    console.log('Saving form data:', formData);
    if (company) {
      await updateCompany(formData);
      setIsEditing(false);
    } else {
      await createCompany(formData);
    }
  };

  const handleCancel = () => {
    if (company) {
      setFormData({
        name: company.name || '',
        legalName: company.legalName || '',
        cnpj: company.cnpj || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || ''
      });
    } else {
      setFormData({
        name: '',
        legalName: '',
        cnpj: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    setIsEditing(false);
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'cnpj' ? formatCNPJ(value) : value
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando informações...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se é prestador, mostrar informações do prestador
  if (profile?.user_type === 'provider') {
    if (!company) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Informações não encontradas</h3>
                <p className="text-slate-600">
                  Não foi possível carregar suas informações de prestador. Entre em contato com o administrador.
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
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Minhas Informações de Prestador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={company.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CPF/CNPJ</Label>
                <Input
                  id="cnpj"
                  value={company.cnpj}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={company.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={company.phone || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={company.address || ''}
                disabled
                className="bg-gray-50"
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Informação:</strong> Estas são suas informações de prestador de serviço cadastradas no sistema. 
                Para alterações, entre em contato com o administrador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não há empresa e o usuário é admin, mostrar opção para criar
  if (!company && profile?.role === 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Criar Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 mb-4">
              Você ainda não tem uma empresa cadastrada. Crie uma empresa para começar a gerenciar o sistema.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Fantasia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="legalName">Razão Social *</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => handleInputChange('legalName', e.target.value)}
                placeholder="Razão social da empresa"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-mail Corporativo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo da empresa"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.name || !formData.legalName || !formData.cnpj || !formData.email}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Empresa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não há empresa e o usuário não é admin
  if (!company) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Empresa não encontrada</h3>
              <p className="text-slate-600">
                Você não está associado a nenhuma empresa. Entre em contato com o administrador para obter um código de acesso.
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
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Fantasia</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                disabled={!isEditing}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="legalName">Razão Social</Label>
            <Input
              id="legalName"
              value={formData.legalName}
              onChange={(e) => handleInputChange('legalName', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              rows={3}
            />
          </div>
          
          {profile?.role === 'admin' && (
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Editar Dados
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
