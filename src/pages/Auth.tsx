import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Building2, Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(3, "Informe seu nome completo").max(100),
});

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  const from = (location.state as { from?: string } | null)?.from || "/";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Falha ao entrar com Google", { description: String(result.error.message ?? result.error) });
      }
      if (result.redirected) return;
    } catch (e) {
      toast.error("Erro inesperado no login com Google");
    } finally {
      setBusy(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
    } else {
      toast.success("Bem-vindo(a) de volta!");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível cadastrar", { description: error.message });
    } else {
      toast.success("Conta criada com sucesso!");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 gradient-hero opacity-90" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(199 89% 48% / 0.4), transparent 40%), radial-gradient(circle at 80% 80%, hsl(214 84% 56% / 0.4), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Left brand column */}
        <div className="hidden flex-col justify-between text-primary-foreground lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-lg font-bold">SCFV</p>
              <p className="text-sm text-white/80">Prefeitura Municipal</p>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-4xl font-bold leading-tight">
              Serviço de Convivência<br />e Fortalecimento de Vínculos
            </h1>
            <p className="max-w-md text-lg text-white/90">
              Uma ferramenta institucional para gerenciar conquistas de crianças, banco de horas e mais — com segurança e simplicidade.
            </p>
            <ul className="space-y-2 text-white/85">
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" /> Login seguro com criptografia
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" /> Interface acessível para toda a equipe
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" /> Auditoria e controle de permissões
              </li>
            </ul>
          </div>

          <p className="text-xs text-white/70">© {new Date().getFullYear()} Prefeitura Municipal — Uso interno</p>
        </div>

        {/* Right auth card */}
        <div className="animate-scale-in rounded-2xl border bg-card p-6 shadow-elegant sm:p-8">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-bold">SCFV</p>
              <p className="text-xs text-muted-foreground">Prefeitura Municipal</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold">Acesso ao Sistema</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com sua conta institucional para continuar.
            </p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="seuemail@prefeitura.gov.br"
                      className="pl-9"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Sua senha"
                      className="pl-9"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome completo</Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      autoComplete="name"
                      required
                      placeholder="Nome e sobrenome"
                      className="pl-9"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="seuemail@prefeitura.gov.br"
                      className="pl-9"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="pl-9"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sua senha é criptografada e verificada contra vazamentos conhecidos.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={busy}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sistema de uso interno. Acessos são monitorados e auditados.
          </p>
        </div>
      </div>
    </div>
  );
}