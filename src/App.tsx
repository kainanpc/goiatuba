import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Conquistas from "./pages/Conquistas";
import BancoHoras from "./pages/BancoHoras";
import Funcionarios from "./pages/Funcionarios";
import Master from "./pages/Master";
import Perfil from "./pages/Perfil";
import Configuracoes from "./pages/Configuracoes";
import Relatorios from "./pages/Relatorios";
import Recompensas from "./pages/Recompensas";

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
                <Route path="/recompensas" element={<Recompensas />} />
                <Route path="/banco-horas" element={<BancoHoras />} />
                <Route
                  path="/relatorios"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <Relatorios />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/funcionarios"
                  element={
                    <ProtectedRoute requireRole="admin">
                      <Funcionarios />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/configuracoes"
                  element={
                    <Configuracoes />
                  }
                />
                <Route
                  path="/master"
                  element={
                    <ProtectedRoute requireRole="owner">
                      <Master />
                    </ProtectedRoute>
                  }
                />
                <Route path="/perfil" element={<Perfil />} />
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
