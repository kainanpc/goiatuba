import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Users, Settings, ShieldCheck, User } from "lucide-react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Conquistas from "./pages/Conquistas";
import BancoHoras from "./pages/BancoHoras";
import { Placeholder } from "./pages/Placeholder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors closeButton position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Index />} />
                <Route path="/conquistas" element={<Conquistas />} />
                <Route path="/banco-horas" element={<BancoHoras />} />
                <Route
                  path="/funcionarios"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <Placeholder
                        title="Gestão de Funcionários"
                        description="Cadastro, edição e permissões da equipe do projeto."
                        icon={Users}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <Placeholder
                        title="Configurações"
                        description="Preferências gerais e informações institucionais."
                        icon={Settings}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master"
                  element={
                    <ProtectedRoute requireRole="owner">
                      <Placeholder
                        title="Painel Master"
                        description="Acesso exclusivo do Dono. Gerencia administradores, permissões, backup e logs."
                        icon={ShieldCheck}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <Placeholder
                      title="Meu Perfil"
                      description="Suas informações pessoais e preferências."
                      icon={User}
                    />
                  }
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
