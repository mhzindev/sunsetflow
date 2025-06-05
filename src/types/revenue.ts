
export interface PendingRevenue {
  id: string;
  mission_id: string;
  client_name: string;
  total_amount: number;
  company_amount: number;
  provider_amount: number;
  due_date: string;
  status: 'pending' | 'received' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
  received_at?: string;
  account_id?: string;
  account_type?: string;
  missions?: {
    title: string;
    location: string;
  };
}

export interface ConfirmedRevenue {
  id: string;
  mission_id: string;
  client_name: string;
  total_amount: number;
  company_amount: number;
  provider_amount: number;
  received_date: string;
  payment_method: string;
  description: string;
  account_id?: string;
  account_type?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  missions?: {
    title: string;
    location: string;
  };
}
