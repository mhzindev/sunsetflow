
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, DollarSign, Calendar, AlertTriangle, X } from 'lucide-react';
import { usePendingRevenues } from '@/hooks/usePendingRevenues';
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { PendingRevenueModal } from './PendingRevenueModal';
import { formatCurrency } from '@/utils/dateUtils';

export const PendingRevenuesManager = () => {
  const { pendingRevenues, loading, convertToConfirmed, cancelPendingRevenue } = usePendingRevenues();
  const { data } = useFinancialSimplified();
  const [selectedRevenue, setSelectedRevenue] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrar apenas receitas com status 'pending' para evitar duplicação
  const activePendingRevenues = pendingRevenues.filter(revenue => 
    revenue.status === 'pending'
  );

  const handleViewRevenue = (revenue: any) => {
    setSelectedRevenue(revenue);
    setIsModalOpen(true);
  };

  const handleConfirmRevenue = async (revenueId: string, accountId: string, accountType: 'bank_account' | 'credit_card') => {
    const result = await convertToConfirmed(revenueId, accountId, accountType, 'transfer');
    if (result.success) {
      setIsModalOpen(false);
      setSelectedRevenue(null);
    }
  };

  const handleCancelRevenue = async (revenueId: string) => {
    const result = await cancelPendingRevenue(revenueId);
    if (result.success) {
      setIsModalOpen(false);
      setSelectedRevenue(null);
    }
  };

  const getUrgencyBadge = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {Math.abs(diffDays)} dia{Math.abs(diffDays) > 1 ? 's' : ''} em atraso
        </Badge>
      );
    } else if (diffDays <= 7) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          Vence em {diffDays} dia{diffDays > 1 ? 's' : ''}
        </Badge>
      );
    }
    return null;
  };

  // Separar contas bancárias e cartões de crédito dos accounts
  const bankAccounts = data.accounts?.filter(account => !('limit' in account)) || [];
  const creditCards = data.accounts?.filter(account => 'limit' in account) || [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando receitas pendentes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Receitas Pendentes
            {activePendingRevenues.length > 0 && (
              <Badge variant="secondary">{activePendingRevenues.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePendingRevenues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Nenhuma receita pendente</h3>
              <p>Todas as receitas foram processadas ou não há receitas aguardando confirmação.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Missão</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Parte da Empresa</TableHead>
                  <TableHead>Parte do Prestador</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Urgência</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePendingRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell className="font-medium">{revenue.client_name}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {revenue.missions?.title || 'Missão não especificada'}
                        </div>
                        {revenue.missions?.location && (
                          <div className="text-sm text-gray-500">{revenue.missions.location}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(revenue.total_amount)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(revenue.company_amount)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(revenue.provider_amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(revenue.due_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{getUrgencyBadge(revenue.due_date)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewRevenue(revenue)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleViewRevenue(revenue)}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PendingRevenueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRevenue(null);
        }}
        revenue={selectedRevenue}
        onConfirm={handleConfirmRevenue}
        onCancel={handleCancelRevenue}
        accounts={bankAccounts}
        creditCards={creditCards}
      />
    </div>
  );
};
