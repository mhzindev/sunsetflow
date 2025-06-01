
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

export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled';
export type PaymentType = 'full' | 'installment' | 'advance' | 'partial';
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
