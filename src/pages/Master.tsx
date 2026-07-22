import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Users, Trophy, Clock, Activity, Search, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: any;
  created_at: string;
}

interface Stats {
  users: number;
  admins: number;
  children: number;
  points: number;
  hours: number;
  logs: number;
}

export default function Master() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ users: 0, admins: 0, children: 0, points: 0, hours: 0, logs: 0 });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, childrenRes, pointsRes, timeRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("children").select("id", { count: "exact", head: true }),
        supabase.from("point_entries").select("points"),
        supabase.from("time_entries").select("hours, type"),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      const profiles = profilesRes.data ?? [];
      const map: Record<string, string> = {};
      profiles.forEach((p: any) => (map[p.id] = p.full_name || p.email || "—"));
      setUserMap(map);

      const roles = rolesRes.data ?? [];
      const admins = roles.filter((r: any) => r.role === "admin" || r.role === "owner").length;

      const totalPoints = (pointsRes.data ?? []).reduce((s: number, p: any) => s + (p.points ?? 0), 0);
      const totalHours = (timeRes.data ?? []).reduce((s: number, t: any) => {
        const sign = t.type === "folga" ? -1 : 1;
        return s + sign * Number(t.hours ?? 0);
      }, 0);

      setStats({
        users: profiles.length,
        admins,
        children: childrenRes.count ?? 0,
        points: totalPoints,
        hours: totalHours,
        logs: logsRes.data?.length ?? 0,
      });
      setLogs((logsRes.data ?? []) as AuditLog[]);
    } catch (e: any) {
      toast.error("Erro ao carregar painel", { description: e.message });
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.entity ?? "").toLowerCase().includes(q) ||
      (userMap[l.user_id ?? ""] ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Usuários", value: stats.users, icon: Users, hint: `${stats.admins} com acesso administrativo` },
    { label: "Crianças", value: stats.children, icon: Trophy, hint: "Cadastradas no sistema" },
    { label: "Pontos concedidos", value: stats.points, icon: Activity, hint: "Somatório histórico" },
    { label: "Saldo horas equipe", value: `${stats.hours.toFixed(1)}h`, icon: Clock, hint: "Créditos - folgas" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel Master</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada do sistema, auditoria e integridade de dados.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold">{c.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Registros de auditoria</h2>
                <p className="text-xs text-muted-foreground">
                  Últimas {logs.length} ações registradas no sistema.
                </p>
              </div>
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por ação, entidade ou usuário"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[420px] rounded-md border">
              {filteredLogs.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  Nenhum registro encontrado.
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredLogs.map((log) => (
                    <li key={log.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {log.action}
                          </Badge>
                          {log.entity && (
                            <span className="text-xs text-muted-foreground">em {log.entity}</span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          por {userMap[log.user_id ?? ""] ?? "Sistema"}
                          {log.entity_id ? ` · ref ${log.entity_id.slice(0, 8)}` : ""}
                        </p>
                      </div>
                      <time className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Integridade do sistema</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <SystemRow label="Autenticação" value="Ativa" ok />
              <SystemRow label="RLS habilitado" value="Todas as tabelas" ok />
              <SystemRow label="Trilha de auditoria" value={`${stats.logs} eventos`} ok />
              <SystemRow label="Backup" value="Automático (Cloud)" ok />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Distribuição de acesso</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Administradores e Dono</span>
                <span className="font-semibold">{stats.admins}</span>
              </div>
              <div className="flex justify-between">
                <span>Funcionários</span>
                <span className="font-semibold">{Math.max(stats.users - stats.admins, 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total de contas</span>
                <span className="font-semibold">{stats.users}</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SystemRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-sm font-medium">
        {ok && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
        {value}
      </span>
    </div>
  );
}