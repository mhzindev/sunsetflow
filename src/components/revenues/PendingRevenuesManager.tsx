
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePendingRevenues } from '@/hooks/usePendingRevenues';
import { useAccounts } from '@/hooks/useAccounts';
import { DollarSign, Calendar, RefreshCw, CheckCircle, X, Building, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/dateUtils';

export const PendingRevenuesManager = () => {
  const { pendingRevenues, loading, fetchPendingRevenues, convertToConfirmed, cancelPendingRevenue } = usePendingRevenues();
  const { bankAccounts, creditCards } = useAccounts();
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; type: 'bank_account' | 'credit_card' }>({ id: '', type: 'bank_account' });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('transfer');
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const handleConvertToConfirmed = async (pendingRevenueId: string) => {
    if (!selectedAccount.id) {
      return;
    }

    setConvertingId(pendingRevenueId);
    try {
      await convertToConfirmed(pendingRevenueId, selectedAccount.id, selectedAccount.type, selectedPaymentMethod);
    } finally {
      setConvertingId(null);
      setSelectedAccount({ id: '', type: 'bank_account' });
      setSelectedPaymentMethod('transfer');
    }
  };

  const handleCancel = async (pendingRevenueId: string) => {
    await cancelPendingRevenue(pendingRevenueId);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      received: { label: 'Recebida', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const pendingOnly = pendingRevenues.filter(revenue => revenue.status === 'pending');
  const totalPending = pendingOnly.reduce((sum, revenue) => sum + revenue.total_amount, 0);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Carregando receitas pendentes...</span>
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
              <Clock className="w-5 h-5 text-yellow-600" />
              Receitas Pendentes ({pendingOnly.length})
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Pendente</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <Button onClick={fetchPendingRevenues} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Receitas Pendentes:</strong>
                <p className="mt-1">Serviços realizados aguardando pagamento do cliente. Confirme quando o pagamento for recebido.</p>
              </div>
            </div>
          </div>

          {pendingRevenues.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma receita pendente
              </h3>
              <p className="text-gray-500">
                As receitas pendentes aparecerão aqui quando missões forem aprovadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRevenues.map((revenue) => (
                <Card key={revenue.id} className="p-4 border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {revenue.missions?.title || 'Missão'}
                        </h3>
                        {getStatusBadge(revenue.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Cliente: {revenue.client_name}
                        </p>
                        
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Vencimento: {formatDate(revenue.due_date)}
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4 mt-3">
                          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                            <div className="font-medium text-yellow-800 mb-1">💰 Valor Total Aguardando</div>
                            <div className="text-xl font-bold text-yellow-900">{formatCurrency(revenue.total_amount)}</div>
                            <div className="text-xs text-yellow-700 mt-1">
                              Aguardando confirmação de pagamento do cliente
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
                    
                    {revenue.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmar Pagamento
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar Recebimento de Pagamento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-3 bg-green-50 rounded border border-green-200">
                                <div className="text-sm text-green-800">
                                  <strong>Valor total a ser confirmado:</strong>
                                  <div className="text-lg font-bold text-green-900 mt-1">
                                    {formatCurrency(revenue.total_amount)}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Método de Pagamento:</label>
                                <Select
                                  value={selectedPaymentMethod}
                                  onValueChange={setSelectedPaymentMethod}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Selecione o método" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="transfer">Transferência</SelectItem>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="cash">Dinheiro</SelectItem>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Tipo de Conta:</label>
                                <Select
                                  value={selectedAccount.type}
                                  onValueChange={(value: 'bank_account' | 'credit_card') => 
                                    setSelectedAccount({ ...selectedAccount, type: value, id: '' })
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Tipo de conta" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bank_account">Conta Bancária</SelectItem>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Conta de Destino:</label>
                                <Select
                                  value={selectedAccount.id}
                                  onValueChange={(value) => setSelectedAccount({ ...selectedAccount, id: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Selecione a conta" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedAccount.type === 'bank_account' 
                                      ? bankAccounts.map((account) => (
                                          <SelectItem key={account.id} value={account.id}>
                                            {account.bank} - {account.name}
                                          </SelectItem>
                                        ))
                                      : creditCards.map((card) => (
                                          <SelectItem key={card.id} value={card.id}>
                                            {card.bank} - {card.name}
                                          </SelectItem>
                                        ))
                                    }
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleConvertToConfirmed(revenue.id)}
                                  disabled={!selectedAccount.id || convertingId === revenue.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {convertingId === revenue.id ? 'Processando...' : 'Confirmar Recebimento'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          onClick={() => handleCancel(revenue.id)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
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
