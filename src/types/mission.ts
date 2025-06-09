
export interface Mission {
  id: string;
  title: string;
  client_name: string;
  location: string;
  start_date: string;
  end_date?: string;
  status: string;
  assigned_providers: string[];
  description?: string;
  service_value?: number;
  company_percentage?: number;
  provider_percentage?: number;
  company_value?: number;
  provider_value?: number;
  is_approved?: boolean;
  provider_id?: string;
  budget?: number;
  total_expenses?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  client_id?: string;
}

export interface MissionWithProvider extends Mission {
  provider?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
  };
  assigned_providers_details?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
  }>;
}

export interface MissionProgress {
  percentage: number;
  completedExpenses: number;
  totalBudget: number;
  description: string;
}
