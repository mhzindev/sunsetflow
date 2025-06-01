
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

export interface Expense {
  id: string;
  missionId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: string;
  accommodationDetails?: {
    actualCost: number;
    reimbursementAmount: number;
    netAmount: number;
    outsourcingCompany?: string;
    invoiceNumber?: string;
  };
}

export interface Payment {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: PaymentStatus;
  type: PaymentType;
  description: string;
  installments?: number;
  currentInstallment?: number;
  tags?: string[];
  notes?: string;
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
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled';
export type PaymentType = 'full' | 'installment' | 'advance';
