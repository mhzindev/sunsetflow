// Usando exatamente os mesmos valores que estão definidos no banco de dados
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue' | 'cancelled';
export type PaymentType = 'full' | 'installment' | 'advance' | 'balance_payment' | 'advance_payment';
export type PaymentMethod = 'pix' | 'transfer' | 'credit_card' | 'debit_card' | 'cash';

// Constantes para garantir consistência - valores EXATOS do banco
export const PAYMENT_STATUS_VALUES = {
  PENDING: 'pending' as const,
  PARTIAL: 'partial' as const,
  COMPLETED: 'completed' as const,
  OVERDUE: 'overdue' as const,
  CANCELLED: 'cancelled' as const
} as const;

export const PAYMENT_TYPE_VALUES = {
  FULL: 'full' as const,
  INSTALLMENT: 'installment' as const,
  ADVANCE: 'advance' as const,
  BALANCE_PAYMENT: 'balance_payment' as const,
  ADVANCE_PAYMENT: 'advance_payment' as const
} as const;

// Funções de validação rigorosas
export const isValidPaymentStatus = (status: any): status is PaymentStatus => {
  return Object.values(PAYMENT_STATUS_VALUES).includes(status);
};

export const isValidPaymentType = (type: any): type is PaymentType => {
  return Object.values(PAYMENT_TYPE_VALUES).includes(type);
};

// Funções de conversão segura
export const toPaymentStatus = (value: any): PaymentStatus => {
  if (isValidPaymentStatus(value)) {
    return value;
  }
  console.warn('Valor inválido para PaymentStatus:', value, 'usando pending como padrão');
  return PAYMENT_STATUS_VALUES.PENDING;
};

export const toPaymentType = (value: any): PaymentType => {
  if (isValidPaymentType(value)) {
    return value;
  }
  console.warn('Valor inválido para PaymentType:', value, 'usando full como padrão');
  return PAYMENT_TYPE_VALUES.FULL;
};

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
  account_id?: string;
  account_type?: 'bank_account' | 'credit_card';
}

export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  paymentMethod: PaymentMethod;
  active: boolean;
  currentBalance?: number;
}

// Interface específica para criação de pagamentos - TIPOS RIGOROSOS
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
