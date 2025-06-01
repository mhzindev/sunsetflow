
export interface Company {
  id: string;
  name: string;
  legal_name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  owner_id: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'owner' | 'employee';
  company_id?: string;
  active: boolean;
  created_at: string;
}

export interface EmployeeAccessCode {
  id: string;
  code: string;
  company_id: string;
  employee_name: string;
  employee_email: string;
  is_used: boolean;
  created_at: string;
  used_at?: string;
  expires_at: string;
}
