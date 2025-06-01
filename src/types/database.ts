
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user';
  active: boolean;
  created_at: string;
}
