
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProviderBalanceDetails } from '@/hooks/useProviderBalanceDetails';
import { ServiceProvider } from '@/types/payment';
import { Eye, RefreshCw, Settings } from 'lucide-react';
import { SettlePendingPaymentsModal } from './SettlePendingPaymentsModal';

interface ProviderBalanceManagerRowProps {
  provider: ServiceProvider;
  onViewDetails: (provider: ServiceProvider) => void;
  onPayBalance: (provider: ServiceProvider) => void;
  onAdvancePayment: (provider: ServiceProvider) => void;
  onRefresh?: () => void;
}

export const ProviderBalanceManagerRow = ({ 
  provider, 
  onViewDetails, 
  onPayBalance, 
  onAdvancePayment,
  onRefresh 
}: ProviderBalanceManagerRowProps) => {
  const { balanceDetails, loading } = useProviderBalanceDetails(provider.id);
  const [showSettleModal, setShowSettleModal] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'bg-green-100 text-green-800';
    if (balance < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleSettleSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <div className="font-medium">{provider.name}</div>
            <div className="text-sm text-gray-500">{provider.email}</div>
          </div>
        </TableCell>
        <TableCell>{provider.service}</TableCell>
        <TableCell>
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Calculando...</span>
            </div>
          ) : (
            <Badge className={getBalanceColor(balanceDetails.currentBalance)}>
              {formatCurrency(balanceDetails.currentBalance)}
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(provider)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Detalhes
            </Button>
            
            {balanceDetails.currentBalance > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={() => onPayBalance(provider)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  Pagar Saldo
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettleModal(true)}
                  disabled={loading}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Liquidar
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdvancePayment(provider)}
              disabled={loading}
            >
              Adiantamento
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <SettlePendingPaymentsModal
        isOpen={showSettleModal}
        onOpenChange={setShowSettleModal}
        provider={provider}
        onSuccess={handleSettleSuccess}
      />
    </>
  );
};
