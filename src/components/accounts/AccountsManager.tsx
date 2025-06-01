
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountsSummary } from './AccountsSummary';
import { BankAccountsList } from './BankAccountsList';
import { CreditCardsList } from './CreditCardsList';
import { AccountTransactions } from './AccountTransactions';
import { NewAccountModal } from './NewAccountModal';
import { NewCardModal } from './NewCardModal';
import { useAccounts } from '@/hooks/useAccounts';
import { Plus, RefreshCw, CreditCard, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AccountsManager = () => {
  const { 
    bankAccounts, 
    creditCards, 
    loading, 
    error, 
    refreshAccounts,
    getAccountSummary
  } = useAccounts();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);

  const handleRefresh = async () => {
    try {
      await refreshAccounts();
      toast({
        title: "Dados atualizados",
        description: "As informações das contas foram recarregadas.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive"
      });
    }
  };

  const summary = getAccountSummary();

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Minhas Contas
            </h3>
            <p className="text-slate-600">
              Gerencie suas contas bancárias e cartões de crédito para um controle financeiro completo.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              onClick={() => setShowNewAccountModal(true)}
              variant="outline"
              size="sm"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
            <Button 
              onClick={() => setShowNewCardModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">
              Resumo
            </TabsTrigger>
            <TabsTrigger value="accounts">
              Contas ({bankAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="cards">
              Cartões ({creditCards.length})
            </TabsTrigger>
            <TabsTrigger value="transactions">
              Movimentações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <AccountsSummary summary={summary} />
          </TabsContent>

          <TabsContent value="accounts" className="mt-6">
            <BankAccountsList accounts={bankAccounts} />
          </TabsContent>

          <TabsContent value="cards" className="mt-6">
            <CreditCardsList cards={creditCards} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <AccountTransactions />
          </TabsContent>
        </Tabs>
      </Card>

      <NewAccountModal 
        open={showNewAccountModal}
        onClose={() => setShowNewAccountModal(false)}
      />

      <NewCardModal 
        open={showNewCardModal}
        onClose={() => setShowNewCardModal(false)}
      />
    </div>
  );
};
