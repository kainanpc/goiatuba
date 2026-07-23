import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoaderCircle } from "lucide-react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Conquistas = lazy(() => import("./pages/Conquistas"));
const BancoHoras = lazy(() => import("./pages/BancoHoras"));
const Funcionarios = lazy(() => import("./pages/Funcionarios"));
const Master = lazy(() => import("./pages/Master"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Recompensas = lazy(() => import("./pages/Recompensas"));
const Logs = lazy(() => import("./pages/Logs"));

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-label="Carregando" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors closeButton position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<RouteFallback />}>
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
                <Route
                  path="/logs"
                  element={
                    <ProtectedRoute requireRole="owner">
                      <Logs />
                    </ProtectedRoute>
                  }
                />
                <Route path="/perfil" element={<Perfil />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
