
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CompanySettings = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - em produção viria de um contexto ou API
  const [companyData, setCompanyData] = useState({
    name: 'Sunsettrack',
    legalName: 'Sunsettrack Tecnologia e Serviços Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@sunsettrack.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - Centro - São Paulo/SP - CEP: 01234-567'
  });

  const handleSave = () => {
    // Aqui seria a integração com o backend para atualizar os dados
    toast({
      title: "Dados da empresa atualizados",
      description: "As informações da empresa foram atualizadas com sucesso.",
    });
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
                value={companyData.name}
                onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={companyData.cnpj}
                onChange={(e) => setCompanyData({...companyData, cnpj: formatCNPJ(e.target.value)})}
                disabled={!isEditing}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="legalName">Razão Social</Label>
            <Input
              id="legalName"
              value={companyData.legalName}
              onChange={(e) => setCompanyData({...companyData, legalName: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={companyData.phone}
                onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                disabled={!isEditing}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={companyData.address}
              onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
              disabled={!isEditing}
              rows={3}
            />
          </div>
          
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
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
