
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountSummary } from '@/types/account';
import { Building2, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";

interface AccountsSummaryProps {
  summary: AccountSummary;
}

export const AccountsSummary = ({ summary }: AccountsSummaryProps) => {
  const totalBankBalance = summary.totalBankBalance || 0;
  const totalCreditLimit = summary.totalCreditLimit || 0;
  const totalCreditUsed = summary.totalCreditUsed || 0;
  const totalCreditAvailable = summary.totalCreditAvailable || 0;
  const accountsCount = summary.accountsCount || 0;
  const cardsCount = summary.cardsCount || 0;

  const creditUtilization = totalCreditLimit > 0 
    ? (totalCreditUsed / totalCreditLimit) * 100 
    : 0;

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 30) return 'text-green-600';
    if (utilization <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Saldo Total em Contas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              R$ {formatCurrency(totalBankBalance)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {accountsCount} conta(s) ativa(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Limite Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              R$ {formatCurrency(totalCreditAvailable)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {cardsCount} cartão(ões) ativo(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Limite Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              R$ {formatCurrency(totalCreditLimit)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Valor usado: R$ {formatCurrency(totalCreditUsed)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Utilização Cartões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(creditUtilization)}`}>
              {creditUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {creditUtilization <= 30 ? 'Excelente' : 
               creditUtilization <= 60 ? 'Moderado' : 'Alto'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Situação Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total em Contas Bancárias:</span>
                <span className="font-semibold text-slate-800">
                  R$ {formatCurrency(totalBankBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Limite de Crédito Disponível:</span>
                <span className="font-semibold text-green-600">
                  R$ {formatCurrency(totalCreditAvailable)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total de Recursos:</span>
                <span className="font-bold text-blue-600 text-lg">
                  R$ {formatCurrency(totalBankBalance + totalCreditAvailable)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Análise de Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Utilização dos Cartões</span>
                  <span className={getUtilizationColor(creditUtilization)}>
                    {creditUtilization.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      creditUtilization <= 30 ? 'bg-green-500' :
                      creditUtilization <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(creditUtilization, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="text-sm text-slate-600">
                <p className="mb-2">
                  <strong>Recomendação:</strong> {
                    creditUtilization <= 30 
                      ? 'Excelente controle! Mantenha a utilização abaixo de 30%.'
                      : creditUtilization <= 60 
                        ? 'Utilize com moderação. Tente reduzir para menos de 30%.'
                        : 'Atenção! Alta utilização pode impactar seu score.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
