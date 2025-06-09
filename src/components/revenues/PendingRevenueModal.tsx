
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Building2, CreditCard, X, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/dateUtils';

interface PendingRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenue: any;
  onConfirm: (revenueId: string, accountId: string, accountType: 'bank_account' | 'credit_card') => void;
  onCancel: (revenueId: string) => void;
  accounts: any[];
  creditCards: any[];
}

export const PendingRevenueModal = ({ 
  isOpen, 
  onClose, 
  revenue, 
  onConfirm, 
  onCancel, 
  accounts, 
  creditCards 
}: PendingRevenueModalProps) => {
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>('');
  const [selectedAccountType, setSelectedAccountType] = React.useState<'bank_account' | 'credit_card'>('bank_account');

  if (!revenue) return null;

  const handleConfirm = () => {
    if (selectedAccountId) {
      onConfirm(revenue.id, selectedAccountId, selectedAccountType);
    }
  };

  const handleCancel = () => {
    onCancel(revenue.id);
  };

  const handleAccountSelection = (accountId: string) => {
    // Determinar o tipo da conta baseado nos dados disponíveis
    const isBankAccount = accounts?.some(acc => acc.id === accountId);
    const isCreditCard = creditCards?.some(card => card.id === accountId);
    
    setSelectedAccountId(accountId);
    if (isCreditCard) {
      setSelectedAccountType('credit_card');
    } else {
      setSelectedAccountType('bank_account');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Confirmar Receita Pendente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Detalhes da Receita</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Cliente:</span>
                      <p className="font-medium">{revenue.client_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Missão:</span>
                      <p className="font-medium">{revenue.missions?.title || 'Não especificada'}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Vencimento:</span>
                      <p className="font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(revenue.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Valores</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Valor Total:</span>
                      <p className="font-bold text-green-600 text-lg">
                        {formatCurrency(revenue.total_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Parte da Empresa:</span>
                      <p className="font-medium">{formatCurrency(revenue.company_amount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Parte do Prestador:</span>
                      <p className="font-medium">{formatCurrency(revenue.provider_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">Selecionar Conta para Recebimento</h4>
            
            <Select value={selectedAccountId} onValueChange={handleAccountSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta que receberá o valor" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={`bank_${account.id}`} value={account.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{account.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {account.bank}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
                {creditCards?.map((card) => (
                  <SelectItem key={`card_${card.id}`} value={card.id}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>{card.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {card.bank}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="text-red-600">
              <X className="w-4 h-4 mr-2" />
              Cancelar Receita
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedAccountId}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Recebimento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
