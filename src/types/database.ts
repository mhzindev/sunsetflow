
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user';
  active: boolean;
  company_id?: string;
  created_at: string;
}
