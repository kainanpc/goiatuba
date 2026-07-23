import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Building2, Loader2, Lock, Mail, Phone, User as UserIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Informe sua senha").max(72),
});

const passwordRule = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(72, "A senha é muito longa")
  .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra")
  .regex(/\d/, "A senha deve conter pelo menos um número");

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(3, "Informe seu nome completo").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    phone: z
      .string()
      .trim()
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone válido"),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

function maskPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });

  const from = (location.state as { from?: string } | null)?.from || "/";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

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
      const msg = /invalid/i.test(error.message)
        ? "E-mail ou senha incorretos."
        : error.message;
      toast.error("Não foi possível entrar", { description: msg });
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
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
        },
      },
    });
    setBusy(false);
    if (error) {
      const msg = /already/i.test(error.message)
        ? "Este e-mail já está cadastrado."
        : error.message;
      toast.error("Não foi possível cadastrar", { description: msg });
    } else {
      // Sign out immediately so pending user doesn't get through
      await supabase.auth.signOut();
      setSignupDone(true);
    }
  };

  if (signupDone) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
        <div className="pointer-events-none absolute inset-0 gradient-hero opacity-90" aria-hidden />
        <div className="relative z-10 w-full max-w-lg animate-scale-in rounded-2xl border bg-card p-8 text-center shadow-elegant">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold">Cadastro enviado!</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu cadastro foi enviado com sucesso. Aguarde a aprovação do administrador.
            Assim que sua conta for analisada, você poderá acessar o sistema.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Aguardando análise
          </div>
          <Button
            className="mt-6 w-full"
            variant="outline"
            onClick={() => {
              setSignupDone(false);
              setTab("signin");
              setForm({ email: "", password: "", confirmPassword: "", fullName: "", phone: "" });
            }}
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

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
                  <Label htmlFor="signup-phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      inputMode="tel"
                      placeholder="(11) 91234-5678"
                      className="pl-9"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
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
                      placeholder="Mínimo 8 caracteres"
                      className="pl-9"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use pelo menos 8 caracteres, com uma letra e um número.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Repita a senha"
                      className="pl-9"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sistema de uso interno. Acessos são monitorados e auditados.
          </p>
        </div>
      </div>
    </div>
  );
}