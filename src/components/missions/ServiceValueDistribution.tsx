
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';

interface ServiceValueDistributionProps {
  serviceValue: number;
  companyPercentage: number;
  onCompanyPercentageChange: (percentage: number) => void;
  onServiceValueChange: (value: number) => void;
  isApproved?: boolean;
  canApprove?: boolean;
  onApprove?: () => void;
  readOnly?: boolean;
}

export const ServiceValueDistribution = ({
  serviceValue,
  companyPercentage,
  onCompanyPercentageChange,
  onServiceValueChange,
  isApproved = false,
  canApprove = false,
  onApprove,
  readOnly = false
}: ServiceValueDistributionProps) => {
  const { user } = useAuth();
  const [providerPercentage, setProviderPercentage] = useState(100 - companyPercentage);
  const [companyValue, setCompanyValue] = useState(0);
  const [providerValue, setProviderValue] = useState(0);

  useEffect(() => {
    const newProviderPercentage = 100 - companyPercentage;
    setProviderPercentage(newProviderPercentage);
    
    const newCompanyValue = (serviceValue * companyPercentage) / 100;
    const newProviderValue = (serviceValue * newProviderPercentage) / 100;
    
    setCompanyValue(newCompanyValue);
    setProviderValue(newProviderValue);
  }, [serviceValue, companyPercentage]);

  const handlePercentageChange = (value: number[]) => {
    if (readOnly || isApproved) return;
    const newCompanyPercentage = value[0];
    onCompanyPercentageChange(newCompanyPercentage);
  };

  const handleServiceValueChange = (value: number) => {
    if (readOnly || isApproved) return;
    onServiceValueChange(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Verificar se o usuário é dono/admin
  const isOwner = user?.user_metadata?.role === 'admin' || user?.user_metadata?.role === 'owner';

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Distribuição do Valor do Serviço</CardTitle>
          {isApproved && (
            <Badge variant="default" className="bg-green-600">
              ✓ Aprovado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="serviceValue">Valor Total do Serviço (R$)</Label>
          <Input
            id="serviceValue"
            type="number"
            step="0.01"
            value={serviceValue || ''}
            onChange={(e) => handleServiceValueChange(parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            disabled={readOnly || isApproved || !isOwner}
          />
          {!isOwner && (
            <p className="text-xs text-gray-500 mt-1">
              * Apenas o dono pode definir o valor do serviço
            </p>
          )}
        </div>

        {serviceValue > 0 && (
          <>
            <div className="space-y-3">
              <Label>Distribuição de Valores</Label>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Empresa: {companyPercentage}%</span>
                  <span>Prestadores: {providerPercentage}%</span>
                </div>
                
                <Slider
                  value={[companyPercentage]}
                  onValueChange={handlePercentageChange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                  disabled={readOnly || isApproved || !isOwner}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Valor da Empresa</div>
                <div className="text-lg font-bold text-blue-900">
                  {formatCurrency(companyValue)}
                </div>
                <div className="text-xs text-blue-600">{companyPercentage}% do total</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">Valor dos Prestadores</div>
                <div className="text-lg font-bold text-green-900">
                  {formatCurrency(providerValue)}
                </div>
                <div className="text-xs text-green-600">{providerPercentage}% do total</div>
              </div>
            </div>

            {canApprove && !isApproved && serviceValue > 0 && isOwner && onApprove && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={onApprove}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  🎯 Aprovar Missão e Registrar Receita
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Ao aprovar, será criada uma transação de receita de {formatCurrency(companyValue)} 
                  e um pagamento pendente de {formatCurrency(providerValue)} para os prestadores.
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
              {isApproved ? (
                "✓ Missão aprovada - Valores registrados no sistema financeiro"
              ) : (
                "* O valor dos prestadores será distribuído igualmente entre todos os prestadores designados para esta missão"
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
