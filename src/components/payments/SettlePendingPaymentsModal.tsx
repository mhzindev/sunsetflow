
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSettlePendingPayments } from '@/hooks/useSettlePendingPayments';
import { ServiceProvider } from '@/types/payment';
import { AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface SettlePendingPaymentsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ServiceProvider;
  onSuccess: () => void;
}

export const SettlePendingPaymentsModal = ({
  isOpen,
  onOpenChange,
  provider,
  onSuccess
}: SettlePendingPaymentsModalProps) => {
  const [settlementAmount, setSettlementAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pendingTotal, setPendingTotal] = useState<number>(0);
  
  const { settlePendingPayments, checkPendingPaymentsTotal, loading } = useSettlePendingPayments();

  useEffect(() => {
    if (isOpen && provider.id) {
      loadPendingTotal();
    }
  }, [isOpen, provider.id]);

  const loadPendingTotal = async () => {
    const total = await checkPendingPaymentsTotal(provider.id);
    setPendingTotal(total);
    setSettlementAmount(total.toString());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSettle = async () => {
    const amount = parseFloat(settlementAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const result = await settlePendingPayments(provider.id, amount, paymentDate);
    
    if (result.success) {
      onSuccess();
      onOpenChange(false);
      setSettlementAmount('');
    }
  };

  const amountDifference = parseFloat(settlementAmount || '0') - pendingTotal;
  const amountsMatch = Math.abs(amountDifference) < 0.01;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Liquidar Pagamentos Pendentes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Prestador</h4>
            <p className="text-blue-700">{provider.name}</p>
            <p className="text-blue-600 text-sm">{provider.email}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-yellow-800">Total de Pagamentos Pendentes</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {formatCurrency(pendingTotal)}
              </Badge>
            </div>
            <p className="text-yellow-700 text-sm">
              Este valor será automaticamente liquidado quando o pagamento for processado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settlement-amount">Valor a Liquidar</Label>
            <Input
              id="settlement-amount"
              type="number"
              step="0.01"
              value={settlementAmount}
              onChange={(e) => setSettlementAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date">Data do Pagamento</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {!amountsMatch && settlementAmount && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {amountDifference > 0 
                  ? `Valor é ${formatCurrency(amountDifference)} maior que os pagamentos pendentes`
                  : `Valor é ${formatCurrency(Math.abs(amountDifference))} menor que os pagamentos pendentes`
                }
              </AlertDescription>
            </Alert>
          )}

          {amountsMatch && settlementAmount && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Valor corresponde exatamente aos pagamentos pendentes. Todos os pagamentos serão liquidados.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSettle}
              disabled={loading || !settlementAmount || parseFloat(settlementAmount) <= 0}
              className="flex-1"
            >
              {loading ? 'Liquidando...' : 'Liquidar Pagamentos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
