
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'employee';
  avatar?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
