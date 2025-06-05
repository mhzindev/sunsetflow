
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfirmedRevenues } from '@/hooks/useConfirmedRevenues';
import { DollarSign, Calendar, RefreshCw, Building, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/dateUtils';

export const ConfirmedRevenuesManager = () => {
  const { confirmedRevenues, loading, fetchConfirmedRevenues } = useConfirmedRevenues();

  const totalConfirmed = confirmedRevenues.reduce((sum, revenue) => sum + revenue.total_amount, 0);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando receitas confirmadas...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Receitas Confirmadas ({confirmedRevenues.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Confirmado</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(totalConfirmed)}
                </p>
              </div>
              <Button onClick={fetchConfirmedRevenues} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <strong>Receitas Confirmadas:</strong>
                <p className="mt-1">Pagamentos já recebidos e registrados como receita da empresa. O dinheiro já está em conta.</p>
              </div>
            </div>
          </div>

          {confirmedRevenues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma receita confirmada
              </h3>
              <p className="text-gray-500">
                As receitas confirmadas aparecerão aqui quando os pagamentos forem recebidos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedRevenues.map((revenue) => (
                <Card key={revenue.id} className="p-4 border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {revenue.missions?.title || 'Missão'}
                        </h3>
                        <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Cliente: {revenue.client_name}
                        </p>
                        
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Recebido em: {formatDate(revenue.received_date)}
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4 mt-3">
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            <div className="font-medium text-green-800 mb-1">💰 Receita Total Confirmada</div>
                            <div className="text-xl font-bold text-green-900">{formatCurrency(revenue.total_amount)}</div>
                            <div className="text-xs text-green-700 mt-1">
                              Método: {revenue.payment_method === 'transfer' ? 'Transferência' : 
                                     revenue.payment_method === 'pix' ? 'PIX' :
                                     revenue.payment_method === 'cash' ? 'Dinheiro' : 
                                     revenue.payment_method}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="text-xs font-medium text-blue-800">Parte da Empresa</div>
                              <div className="text-sm font-semibold text-blue-900">{formatCurrency(revenue.company_amount)}</div>
                            </div>
                            <div className="p-2 bg-purple-50 rounded border border-purple-200">
                              <div className="text-xs font-medium text-purple-800">Parte do Prestador</div>
                              <div className="text-sm font-semibold text-purple-900">{formatCurrency(revenue.provider_amount)}</div>
                            </div>
                          </div>
                        </div>
                        
                        {revenue.description && (
                          <p className="mt-2 text-gray-700">{revenue.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
