
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

// Usando exatamente os mesmos valores que estão no banco de dados
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled';
export type PaymentType = 'full' | 'installment' | 'advance';
export type PaymentMethod = 'pix' | 'transfer' | 'credit_card' | 'debit_card' | 'cash';

export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  paymentMethod: PaymentMethod;
  active: boolean;
}

// Interface específica para criação de pagamentos com valores do banco
export interface PaymentCreateData {
  provider_id?: string;
  provider_name: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
  type: PaymentType;
  description: string;
  installments?: number;
  current_installment?: number;
  tags?: string[];
  notes?: string;
  account_id?: string;
  account_type?: 'bank_account' | 'credit_card';
}
