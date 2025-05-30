
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  method: PaymentMethod;
  status: TransactionStatus;
  userId: string;
  userName: string;
  receipt?: string;
  tags?: string[];
  missionId?: string;
}

export type TransactionCategory = 
  | 'service_payment'    // Pagamento de serviços
  | 'client_payment'     // Recebimento de cliente
  | 'fuel'              // Combustível
  | 'accommodation'     // Hospedagem
  | 'meals'             // Alimentação
  | 'materials'         // Materiais
  | 'maintenance'       // Manutenção
  | 'office_expense'    // Despesa escritório
  | 'other';

export type PaymentMethod = 'pix' | 'transfer' | 'credit_card' | 'debit_card' | 'cash';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
