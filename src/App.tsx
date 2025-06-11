
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContextOptimized";
import IndexOptimized from "./pages/IndexOptimized";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <h2 className="text-xl font-semibold text-gray-900">Carregando...</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  console.log('ProtectedRoute: Estado da autenticação:', { 
    user: !!user, 
    profile: !!profile, 
    loading,
    isAuthenticated: !!user && !!profile
  });
  
  if (loading) {
    return <LoadingScreen message="Verificando autenticação e empresa" />;
  }
  
  if (!user || !profile) {
    console.log('ProtectedRoute: Redirecionando para /auth - user:', !!user, 'profile:', !!profile);
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  
  console.log('AuthRoute: Estado da autenticação:', { 
    user: !!user, 
    profile: !!profile, 
    loading 
  });
  
  if (loading) {
    return <LoadingScreen message="Verificando se já está logado" />;
  }
  
  if (user && profile) {
    console.log('AuthRoute: Usuário autenticado, redirecionando para /');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <IndexOptimized />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth" 
              element={
                <AuthRoute>
                  <Auth />
                </AuthRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
