import { useEffect, useState } from "react";
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
  Medal,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RankedChild {
  id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
}

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
  const [top, setTop] = useState<RankedChild[]>([]);

  useEffect(() => {
    document.title = "Início · SCFV Prefeitura";
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: kids }, { data: pts }] = await Promise.all([
        supabase.from("children").select("id, full_name, avatar_url").eq("active", true),
        supabase.from("point_entries").select("child_id, points"),
      ]);
      if (cancelled) return;
      const totals = new Map<string, number>();
      (pts ?? []).forEach((p: any) => {
        totals.set(p.child_id, (totals.get(p.child_id) ?? 0) + (p.points ?? 0));
      });
      const ranked = (kids ?? [])
        .map((k: any) => ({ ...k, points: totals.get(k.id) ?? 0 }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 3);
      setTop(ranked);
    }
    void load();
    const channel = supabase
      .channel("home-ranking")
      .on("postgres_changes", { event: "*", schema: "public", table: "point_entries" }, () => void load())
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
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

      {/* Top 3 Ranking */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Ranking das Crianças</h2>
            <p className="text-sm text-muted-foreground">Top 3 com maior pontuação acumulada.</p>
          </div>
          <Medal className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>
        {top.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Ainda não há pontuação registrada.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {top.map((c, i) => {
              const medals = [
                { emoji: "🥇", label: "Ouro", color: "from-amber-400 to-yellow-600", border: "border-amber-400" },
                { emoji: "🥈", label: "Prata", color: "from-slate-300 to-slate-500", border: "border-slate-400" },
                { emoji: "🥉", label: "Bronze", color: "from-orange-400 to-orange-700", border: "border-orange-500" },
              ];
              const m = medals[i];
              return (
                <Card
                  key={c.id}
                  className={`relative animate-scale-in overflow-hidden border-2 ${m.border} p-5 shadow-card-soft`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${m.color}`} />
                  <div className="flex items-center gap-4">
                    <div className="text-4xl" aria-hidden>{m.emoji}</div>
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={c.avatar_url ?? undefined} alt={c.full_name} />
                      <AvatarFallback>{c.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-bold">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.label} lugar</p>
                      <p className="mt-1 text-lg font-bold text-primary">{c.points} pts</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
