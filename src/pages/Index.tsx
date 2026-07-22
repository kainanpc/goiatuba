import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Clock,
  Users,
  Settings,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const modules = [
  {
    title: "Sistema de Conquistas",
    description: "Caderneta virtual das crianças, pontos, medalhas e lojinha de trocas.",
    icon: Trophy,
    href: "/conquistas",
    tag: "Educadores",
    accent: "from-primary to-accent",
  },
  {
    title: "Banco de Horas",
    description: "Registro de plantões, horas extras e folgas dos funcionários.",
    icon: Clock,
    href: "/banco-horas",
    tag: "Equipe",
    accent: "from-accent to-primary",
  },
];

const adminModules = [
  {
    title: "Funcionários",
    description: "Cadastro e gestão da equipe do projeto.",
    icon: Users,
    href: "/funcionarios",
  },
  {
    title: "Configurações",
    description: "Preferências e informações institucionais.",
    icon: Settings,
    href: "/configuracoes",
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Index() {
  const { profile, role } = useAuth();

  useEffect(() => {
    document.title = "Início · SCFV Prefeitura";
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? "colega";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-card-soft sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-90 gradient-hero"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float"
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl text-primary-foreground">
          <Badge className="mb-4 bg-white/15 text-white backdrop-blur hover:bg-white/20">
            <Sparkles className="mr-1 h-3 w-3" /> SCFV · Prefeitura Municipal
          </Badge>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/90 sm:text-lg">
            Bem-vindo(a) ao sistema institucional do Serviço de Convivência e Fortalecimento
            de Vínculos. Escolha um módulo abaixo para começar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/conquistas"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-elegant transition-transform hover:scale-[1.02]"
            >
              <Trophy className="h-4 w-4" />
              Ir para Conquistas
            </Link>
            <Link
              to="/banco-horas"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <Clock className="h-4 w-4" />
              Banco de Horas
            </Link>
          </div>
        </div>
      </section>

      {/* Quick info */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sistema", value: "Operacional", tone: "text-success" },
          { label: "Seu papel", value: role === "owner" ? "Dono" : role === "admin" ? "Administrador" : "Funcionário" },
          { label: "Último acesso", value: "Agora" },
        ].map((info) => (
          <Card key={info.label} className="p-4 shadow-card-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{info.label}</p>
            <p className={`mt-1 font-display text-lg font-bold ${info.tone ?? "text-foreground"}`}>
              {info.value}
            </p>
          </Card>
        ))}
      </section>

      {/* Modules */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Módulos disponíveis</h2>
            <p className="text-sm text-muted-foreground">Clique para acessar cada área.</p>
          </div>
          <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {modules.map((m, i) => (
            <Link
              key={m.href}
              to={m.href}
              className="module-card group animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
              aria-label={m.title}
            >
              <div className="relative flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${m.accent} text-white shadow-elegant transition-transform group-hover:scale-110`}
                >
                  <m.icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{m.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{m.tag}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Admin section */}
      {(role === "admin" || role === "owner") && (
        <section>
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Administração</h2>
            <p className="text-sm text-muted-foreground">Ferramentas de gestão da equipe.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {adminModules.map((m) => (
              <Link
                key={m.href}
                to={m.href}
                className="module-card group"
                aria-label={m.title}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Owner CTA */}
      {role === "owner" && (
        <section>
          <Link
            to="/master"
            className="relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10 p-5 transition-all hover:border-primary/60 hover:shadow-elegant"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold">Painel Master</h3>
                <Badge className="bg-primary text-primary-foreground">Exclusivo Dono</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Configurações do sistema, gestão de administradores, logs e backup.
              </p>
            </div>
            <ArrowRight className="h-6 w-6 text-primary" />
          </Link>
        </section>
      )}
    </div>
  );
}
