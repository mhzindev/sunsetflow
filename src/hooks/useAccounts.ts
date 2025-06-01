
import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { BankAccount, CreditCard, AccountTransaction, AccountSummary } from '@/types/account';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAccounts = () => {
  const { user } = useAuth();
  const supabaseData = useSupabaseData();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = async () => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contas bancárias:', err);
      throw err;
    }
  };

  const fetchCreditCards = async () => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar cartões de crédito:', err);
      throw err;
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setBankAccounts([]);
        setCreditCards([]);
        return;
      }

      const [bankAccountsData, creditCardsData] = await Promise.all([
        fetchBankAccounts(),
        fetchCreditCards()
      ]);
      
      setBankAccounts(bankAccountsData);
      setCreditCards(creditCardsData);
      
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          name: account.name,
          bank: account.bank,
          account_type: account.accountType,
          account_number: account.accountNumber,
          agency: account.agency,
          balance: account.balance,
          is_active: account.isActive
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchAccounts(); // Refresh data
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao adicionar conta:', err);
      return { success: false, error: 'Erro ao adicionar conta' };
    }
  };

  const addCreditCard = async (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'availableLimit' | 'usedLimit'>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          name: card.name,
          bank: card.bank,
          card_number: card.cardNumber,
          brand: card.brand,
          credit_limit: card.limit,
          available_limit: card.limit,
          used_limit: 0,
          due_date: card.dueDate,
          closing_date: card.closingDate,
          is_active: card.isActive
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchAccounts(); // Refresh data
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao adicionar cartão:', err);
      return { success: false, error: 'Erro ao adicionar cartão' };
    }
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({
          name: updates.name,
          bank: updates.bank,
          account_type: updates.accountType,
          account_number: updates.accountNumber,
          agency: updates.agency,
          balance: updates.balance,
          is_active: updates.isActive
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchAccounts(); // Refresh data
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      return { success: false, error: 'Erro ao atualizar conta' };
    }
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({
          name: updates.name,
          bank: updates.bank,
          card_number: updates.cardNumber,
          brand: updates.brand,
          credit_limit: updates.limit,
          due_date: updates.dueDate,
          closing_date: updates.closingDate,
          is_active: updates.isActive
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchAccounts(); // Refresh data
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar cartão:', err);
      return { success: false, error: 'Erro ao atualizar cartão' };
    }
  };

  const getAccountSummary = (): AccountSummary => {
    const totalBankBalance = bankAccounts
      .filter(account => account.isActive)
      .reduce((sum, account) => sum + account.balance, 0);

    const totalCreditLimit = creditCards
      .filter(card => card.isActive)
      .reduce((sum, card) => sum + card.limit, 0);

    const totalCreditUsed = creditCards
      .filter(card => card.isActive)
      .reduce((sum, card) => sum + card.usedLimit, 0);

    const totalCreditAvailable = creditCards
      .filter(card => card.isActive)
      .reduce((sum, card) => sum + card.availableLimit, 0);

    return {
      totalBankBalance,
      totalCreditLimit,
      totalCreditUsed,
      totalCreditAvailable,
      accountsCount: bankAccounts.filter(a => a.isActive).length,
      cardsCount: creditCards.filter(c => c.isActive).length
    };
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  return {
    bankAccounts,
    creditCards,
    accountTransactions,
    loading,
    error,
    addBankAccount,
    addCreditCard,
    updateBankAccount,
    updateCreditCard,
    getAccountSummary,
    refreshAccounts: fetchAccounts
  };
};
