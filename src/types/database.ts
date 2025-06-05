
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user';
  active: boolean;
  company_id?: string;
  user_type?: 'admin' | 'user' | 'provider';
  provider_id?: string;
  created_at: string;
}
