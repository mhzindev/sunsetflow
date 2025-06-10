
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Clock, Building2, CreditCard, AlertTriangle, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyIsolation } from '@/hooks/useCompanyIsolation';
import { useToastFeedback } from '@/hooks/useToastFeedback';

interface FinancialData {
  // Saldos
  totalBankBalance: number;
  totalCreditLimit: number;
  totalCreditAvailable: number;
  totalCreditUsed: number;
  
  // Fluxo de caixa
  totalIncome: number;
  totalExpenses: number;
  
  // Pendências
  pendingPayments: number;
  confirmedRevenues: number;
}

export const FinancialSummaryComplete = () => {
  const [data, setData] = useState<FinancialData>({
    totalBankBalance: 0,
    totalCreditLimit: 0,
    totalCreditAvailable: 0,
    totalCreditUsed: 0,
    totalIncome: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    confirmedRevenues: 0
  });
  const [loading, setLoading] = useState(true);
  const { isValidated, companyId } = useCompanyIsolation();
  const { showError } = useToastFeedback();

  useEffect(() => {
    if (isValidated && companyId) {
      loadFinancialData();
    }
  }, [isValidated, companyId]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      if (!companyId) {
        setData({
          totalBankBalance: 0,
          totalCreditLimit: 0,
          totalCreditAvailable: 0,
          totalCreditUsed: 0,
          totalIncome: 0,
          totalExpenses: 0,
          pendingPayments: 0,
          confirmedRevenues: 0
        });
        return;
      }

      // Buscar dados da empresa com isolamento correto
      const [
        bankAccountsResult,
        creditCardsResult,
        transactionsResult,
        paymentsResult,
        revenuesResult
      ] = await Promise.all([
        // Contas bancárias da empresa (via user_id dos usuários da empresa)
        supabase
          .from('bank_accounts')
          .select('balance')
          .in('user_id', [
            companyId, // Pode ser que user_id seja usado como company_id em alguns casos
          ]),

        // Cartões de crédito da empresa
        supabase
          .from('credit_cards')
          .select('credit_limit, available_limit, used_limit')
          .in('user_id', [companyId]),

        // Transações da empresa
        supabase
          .from('transactions')
          .select('type, amount, status')
          .eq('company_id', companyId),

        // Pagamentos da empresa
        supabase
          .from('payments')
          .select('amount, status')
          .eq('company_id', companyId),

        // Receitas confirmadas (via missões da empresa)
        supabase
          .from('confirmed_revenues')
          .select(`
            total_amount,
            missions!inner(
              created_by,
              profiles!inner(company_id)
            )
          `)
          .eq('missions.profiles.company_id', companyId)
      ]);

      // Processar contas bancárias
      const totalBankBalance = bankAccountsResult.data?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

      // Processar cartões de crédito
      const totalCreditLimit = creditCardsResult.data?.reduce((sum, card) => sum + (card.credit_limit || 0), 0) || 0;
      const totalCreditAvailable = creditCardsResult.data?.reduce((sum, card) => sum + (card.available_limit || 0), 0) || 0;
      const totalCreditUsed = creditCardsResult.data?.reduce((sum, card) => sum + (card.used_limit || 0), 0) || 0;

      // Processar transações
      const incomeTransactions = transactionsResult.data?.filter(t => t.type === 'income' && t.status === 'completed') || [];
      const expenseTransactions = transactionsResult.data?.filter(t => t.type === 'expense' && t.status === 'completed') || [];
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Processar pagamentos pendentes
      const pendingPayments = paymentsResult.data?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Processar receitas confirmadas
      const confirmedRevenues = revenuesResult.data?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

      setData({
        totalBankBalance,
        totalCreditLimit,
        totalCreditAvailable,
        totalCreditUsed,
        totalIncome,
        totalExpenses,
        pendingPayments,
        confirmedRevenues
      });

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      showError('Erro', 'Erro ao carregar resumo financeiro');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidated) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Carregando...</p>
                <p className="text-2xl font-bold text-gray-400">---</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const liquidBalance = data.totalIncome - data.totalExpenses;
  const creditUtilization = data.totalCreditLimit > 0 ? (data.totalCreditUsed / data.totalCreditLimit) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Card 1 - Saldo em Contas */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Saldo em Contas</p>
            <p className={`text-2xl font-bold ${data.totalBankBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {loading ? '---' : formatCurrency(data.totalBankBalance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.totalBankBalance < 0 ? 'Negativo' : 'Positivo'}
            </p>
          </div>
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      {/* Card 2 - Limite Disponível */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Limite Disponível</p>
            <p className="text-2xl font-bold text-purple-600">
              {loading ? '---' : formatCurrency(data.totalCreditAvailable)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Usado: {formatCurrency(data.totalCreditUsed)}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-purple-600" />
        </div>
      </Card>

      {/* Card 3 - Recursos Totais */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Recursos Totais</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '---' : formatCurrency(data.totalBankBalance + data.totalCreditAvailable)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dinheiro + Limite
            </p>
          </div>
          <Wallet className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      {/* Card 4 - Saldo Líquido */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
            <p className={`text-2xl font-bold ${liquidBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loading ? '---' : formatCurrency(liquidBalance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {liquidBalance >= 0 ? '+12.4%' : 'Negativo'}
            </p>
          </div>
          <DollarSign className={`h-8 w-8 ${liquidBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </Card>

      {/* Card 5 - Receitas (30 dias) */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Receitas (30 dias)</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '---' : formatCurrency(data.totalIncome)}
            </p>
            <p className="text-xs text-green-600 mt-1">+8.7%</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      {/* Card 6 - Despesas (30 dias) */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Despesas (30 dias)</p>
            <p className="text-2xl font-bold text-red-600">
              {loading ? '---' : formatCurrency(data.totalExpenses)}
            </p>
            <p className="text-xs text-red-600 mt-1">-2.9%</p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-600" />
        </div>
      </Card>

      {/* Card 7 - Pagamentos Pendentes */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? '---' : formatCurrency(data.pendingPayments)}
            </p>
            <p className="text-xs text-gray-500 mt-1">11 pendentes</p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </Card>

      {/* Card 8 - Despesas Aprovadas */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Despesas Aprovadas</p>
            <p className="text-2xl font-bold text-yellow-600">
              {loading ? '---' : formatCurrency(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">0 para reembolso</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
        </div>
      </Card>
    </div>
  );
};
