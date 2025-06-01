
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BankAccount, CreditCard } from '@/types/account';
import { Building2, CreditCard as CreditCardIcon, Edit, Calendar } from "lucide-react";

interface AccountViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: BankAccount | CreditCard | null;
  onEdit: () => void;
}

export const AccountViewModal = ({ isOpen, onClose, account, onEdit }: AccountViewModalProps) => {
  if (!account) return null;

  const isCreditCard = 'limit' in account;
  
  const formatCurrency = (value: number | undefined) => {
    return (value || 0).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      investment: 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreditCard ? (
              <CreditCardIcon className="w-5 h-5" />
            ) : (
              <Building2 className="w-5 h-5" />
            )}
            {account.name || 'Conta sem nome'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Informações Gerais</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600">Nome:</span>
                  <p className="font-medium">{account.name || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Banco:</span>
                  <p className="font-medium">{account.bank || 'Não informado'}</p>
                </div>
                {!isCreditCard && (
                  <>
                    <div>
                      <span className="text-sm text-slate-600">Tipo:</span>
                      <Badge className="ml-2">
                        {getAccountTypeLabel((account as BankAccount).accountType)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Agência / Conta:</span>
                      <p className="font-medium">
                        {(account as BankAccount).agency || 'N/A'} / {(account as BankAccount).accountNumber || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
                {isCreditCard && (
                  <>
                    <div>
                      <span className="text-sm text-slate-600">Bandeira:</span>
                      <Badge className="ml-2">
                        {((account as CreditCard).brand || 'other').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Final do Cartão:</span>
                      <p className="font-medium">**** {(account as CreditCard).cardNumber || '0000'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Vencimento / Fechamento:</span>
                      <p className="font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {(account as CreditCard).dueDate || 'N/A'} / {(account as CreditCard).closingDate || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Dados Financeiros</h4>
              <div className="space-y-3">
                {!isCreditCard ? (
                  <div className="text-center">
                    <div className="text-sm text-slate-600">Saldo Atual</div>
                    <div className={`text-2xl font-bold ${
                      ((account as BankAccount).balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency((account as BankAccount).balance)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-slate-600">Limite Total</div>
                        <div className="font-bold text-slate-800">
                          {formatCurrency((account as CreditCard).limit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600">Utilizado</div>
                        <div className="font-bold text-red-600">
                          {formatCurrency((account as CreditCard).usedLimit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600">Disponível</div>
                        <div className="font-bold text-green-600">
                          {formatCurrency((account as CreditCard).availableLimit)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
