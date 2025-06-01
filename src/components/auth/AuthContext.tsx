
import { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContext as AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from your authentication service
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@sunsettrack.com',
    role: 'owner',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos@sunsettrack.com',
    role: 'employee',
    active: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'João Oliveira',
    email: 'joao@sunsettrack.com',
    role: 'employee',
    active: true,
    createdAt: '2024-01-01'
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUsers[0]); // Default to owner for demo

  const login = async (email: string, password: string) => {
    // Mock login - in a real app, this would validate credentials
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
