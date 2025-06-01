
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BankAccount } from '@/types/account';
import { Building2, Edit, Eye, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BankAccountsListProps {
  accounts: BankAccount[];
}

export const BankAccountsList = ({ accounts }: BankAccountsListProps) => {
  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      investment: 'Investimento'
    };
    return types[type as keyof typeof types] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      checking: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            Nenhuma conta cadastrada
          </h3>
          <p className="text-slate-500">
            Adicione suas contas bancárias para começar o controle financeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-slate-600" />
                  <h4 className="text-lg font-semibold text-slate-800">
                    {account.name}
                  </h4>
                  <Badge className={getAccountTypeColor(account.accountType)}>
                    {getAccountTypeLabel(account.accountType)}
                  </Badge>
                  {!account.isActive && (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-slate-600">Banco</p>
                    <p className="font-medium text-slate-800">{account.bank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Agência / Conta</p>
                    <p className="font-medium text-slate-800">
                      {account.agency} / {account.accountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Saldo Atual</p>
                    <p className={`text-xl font-bold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {account.balance.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Última Atualização</p>
                    <p className="font-medium text-slate-800">
                      {new Date(account.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
