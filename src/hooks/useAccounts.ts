
import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { BankAccount, CreditCard, AccountTransaction, AccountSummary } from '@/types/account';

export const useAccounts = () => {
  const supabaseData = useSupabaseData();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulação de dados - Em produção, conectar com Supabase
  const mockBankAccounts: BankAccount[] = [
    {
      id: '1',
      name: 'Conta Corrente Empresa',
      bank: 'Banco do Brasil',
      accountType: 'checking',
      accountNumber: '12345-6',
      agency: '1234-5',
      balance: 25000.00,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-02-01'
    },
    {
      id: '2',
      name: 'Conta Poupança',
      bank: 'Caixa Econômica',
      accountType: 'savings',
      accountNumber: '98765-4',
      agency: '9876-5',
      balance: 15000.00,
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-02-01'
    }
  ];

  const mockCreditCards: CreditCard[] = [
    {
      id: '1',
      name: 'Cartão Empresarial',
      bank: 'Banco do Brasil',
      cardNumber: '1234',
      brand: 'visa',
      limit: 50000.00,
      availableLimit: 35000.00,
      usedLimit: 15000.00,
      dueDate: 15,
      closingDate: 10,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-02-01'
    },
    {
      id: '2',
      name: 'Cartão Viagem',
      bank: 'Itaú',
      cardNumber: '5678',
      brand: 'mastercard',
      limit: 30000.00,
      availableLimit: 25000.00,
      usedLimit: 5000.00,
      dueDate: 20,
      closingDate: 15,
      isActive: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-02-01'
    }
  ];

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Por enquanto usando dados mock
      // Em produção, fazer chamadas reais para Supabase
      setBankAccounts(mockBankAccounts);
      setCreditCards(mockCreditCards);
      setAccountTransactions([]);
      
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAccount: BankAccount = {
        ...account,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setBankAccounts(prev => [...prev, newAccount]);
      return { success: true, data: newAccount };
    } catch (err) {
      console.error('Erro ao adicionar conta:', err);
      return { success: false, error: 'Erro ao adicionar conta' };
    }
  };

  const addCreditCard = async (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'availableLimit' | 'usedLimit'>) => {
    try {
      const newCard: CreditCard = {
        ...card,
        id: Date.now().toString(),
        availableLimit: card.limit,
        usedLimit: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCreditCards(prev => [...prev, newCard]);
      return { success: true, data: newCard };
    } catch (err) {
      console.error('Erro ao adicionar cartão:', err);
      return { success: false, error: 'Erro ao adicionar cartão' };
    }
  };

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    try {
      setBankAccounts(prev => prev.map(account => 
        account.id === id 
          ? { ...account, ...updates, updatedAt: new Date().toISOString() }
          : account
      ));
      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      return { success: false, error: 'Erro ao atualizar conta' };
    }
  };

  const updateCreditCard = async (id: string, updates: Partial<CreditCard>) => {
    try {
      setCreditCards(prev => prev.map(card => 
        card.id === id 
          ? { ...card, ...updates, updatedAt: new Date().toISOString() }
          : card
      ));
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
    fetchAccounts();
  }, []);

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
