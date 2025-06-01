
export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  accountType: 'checking' | 'savings' | 'investment';
  accountNumber: string;
  agency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  cardNumber: string; // Últimos 4 dígitos
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'other';
  limit: number;
  availableLimit: number;
  usedLimit: number;
  dueDate: number; // Dia do vencimento (1-31)
  closingDate: number; // Dia do fechamento (1-31)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountTransaction {
  id: string;
  accountId: string;
  accountType: 'bank' | 'credit_card';
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AccountSummary {
  totalBankBalance: number;
  totalCreditLimit: number;
  totalCreditUsed: number;
  totalCreditAvailable: number;
  accountsCount: number;
  cardsCount: number;
}
