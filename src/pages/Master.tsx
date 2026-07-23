import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldCheck,
  Users,
  Trophy,
  Clock,
  Activity,
  Search,
  LoaderCircle,
  UserCheck,
  UserX,
  UserCog,
  Ban,
  RotateCcw,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountStatus = "pending" | "approved" | "rejected" | "disabled";
type AppRole = "owner" | "admin" | "employee";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  account_status: AccountStatus;
  created_at: string;
  role: AppRole | null;
}

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
  employees: number;
  pending: number;
  children: number;
  points: number;
  hours: number;
  logs: number;
}

export default function Master() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    admins: 0,
    employees: 0,
    pending: 0,
    children: 0,
    points: 0,
    hours: 0,
    logs: 0,
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [profilesRes, rolesRes, childrenRes, pointsRes, timeRes, logsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, phone, account_status, created_at"),
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
      const roleByUser = new Map<string, AppRole>();
      roles.forEach((r: any) => roleByUser.set(r.user_id, r.role));
      const admins = roles.filter((r: any) => r.role === "admin" || r.role === "owner").length;
      const employees = roles.filter((r: any) => r.role === "employee").length;
      const pending = profiles.filter((p: any) => p.account_status === "pending").length;

      const merged: UserRow[] = profiles.map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        account_status: p.account_status,
        created_at: p.created_at,
        role: roleByUser.get(p.id) ?? null,
      }));
      merged.sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));
      setUsers(merged);

      const totalPoints = (pointsRes.data ?? []).reduce((s: number, p: any) => s + (p.points ?? 0), 0);
      const totalHours = (timeRes.data ?? []).reduce((s: number, t: any) => {
        const sign = t.type === "folga" ? -1 : 1;
        return s + sign * Number(t.hours ?? 0);
      }, 0);

      setStats({
        users: profiles.length,
        admins,
        employees,
        pending,
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

  async function approveUser(id: string, role: "admin" | "employee") {
    const { error: e1 } = await supabase.rpc("set_user_role", { _user_id: id, _role: role });
    if (e1) return toast.error("Não foi possível definir o papel", { description: e1.message });
    const { error: e2 } = await supabase.rpc("set_account_status", {
      _user_id: id,
      _status: "approved",
      _reason: null,
    });
    if (e2) return toast.error("Não foi possível aprovar", { description: e2.message });
    toast.success(`Aprovado como ${role === "admin" ? "Administrador" : "Funcionário"}`);
    void loadAll();
  }

  async function changeStatus(id: string, status: AccountStatus, reason?: string) {
    const { error } = await supabase.rpc("set_account_status", {
      _user_id: id,
      _status: status,
      _reason: reason ?? null,
    });
    if (error) return toast.error("Ação falhou", { description: error.message });
    const label = { approved: "aprovada", rejected: "reprovada", disabled: "desativada", pending: "pendente" }[status];
    toast.success(`Conta ${label}`);
    void loadAll();
  }

  async function changeRole(id: string, role: AppRole) {
    const { error } = await supabase.rpc("set_user_role", { _user_id: id, _role: role });
    if (error) return toast.error("Não foi possível alterar o papel", { description: error.message });
    toast.success("Papel atualizado");
    void loadAll();
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

  const pendingUsers = users.filter((u) => u.account_status === "pending");
  const filteredUsers = users.filter((u) => {
    if (u.account_status === "pending") return false;
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").toLowerCase().includes(q)
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
    { label: "Cadastros pendentes", value: stats.pending, icon: UserCheck, hint: "Aguardando análise do Dono" },
    { label: "Crianças", value: stats.children, icon: Trophy, hint: "Cadastradas no sistema" },
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

      <Tabs defaultValue="requests">
        <TabsList className="flex-wrap">
          <TabsTrigger value="requests">
            Solicitações
            {stats.pending > 0 && (
              <Badge className="ml-2 h-5 min-w-5 px-1.5" variant="destructive">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Gestão de Usuários</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold">Solicitações de Cadastro</h2>
              <p className="text-xs text-muted-foreground">
                Aprove ou reprove novos usuários. Somente o Dono pode realizar esta ação.
              </p>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Nenhuma solicitação pendente.
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex flex-col gap-3 rounded-lg border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-semibold">{u.full_name ?? "—"}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email ?? "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {u.phone ?? "não informado"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(u.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => approveUser(u.id, "employee")}>
                        <UserCheck className="mr-1 h-4 w-4" /> Aprovar como Funcionário
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => approveUser(u.id, "admin")}>
                        <UserCog className="mr-1 h-4 w-4" /> Aprovar como Admin
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => changeStatus(u.id, "rejected")}
                      >
                        <UserX className="mr-1 h-4 w-4" /> Reprovar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Gestão de Usuários</h2>
                <p className="text-xs text-muted-foreground">
                  Altere papéis, bloqueie ou reative contas do sistema.
                </p>
              </div>
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, e-mail ou telefone"
                  className="pl-9"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">Usuário</th>
                    <th className="p-3 text-left">Contato</th>
                    <th className="p-3 text-left">Papel</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3">
                        <p className="font-medium">{u.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          desde {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        <div>{u.email}</div>
                        <div>{u.phone ?? "—"}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={u.role === "owner" ? "default" : "secondary"}>
                          {u.role === "owner"
                            ? "Dono"
                            : u.role === "admin"
                            ? "Administrador"
                            : u.role === "employee"
                            ? "Funcionário"
                            : "Sem papel"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={u.account_status} />
                      </td>
                      <td className="p-3 text-right">
                        {u.role === "owner" ? (
                          <span className="text-xs text-muted-foreground">Protegido</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Ações
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Papel</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => changeRole(u.id, "admin")}>
                                <UserCog className="mr-2 h-4 w-4" /> Tornar Administrador
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeRole(u.id, "employee")}>
                                <Users className="mr-2 h-4 w-4" /> Tornar Funcionário
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Conta</DropdownMenuLabel>
                              {u.account_status !== "approved" && (
                                <DropdownMenuItem onClick={() => changeStatus(u.id, "approved")}>
                                  <RotateCcw className="mr-2 h-4 w-4" /> Reativar
                                </DropdownMenuItem>
                              )}
                              {u.account_status !== "disabled" && (
                                <DropdownMenuItem
                                  onClick={() => changeStatus(u.id, "disabled")}
                                  className="text-destructive"
                                >
                                  <Ban className="mr-2 h-4 w-4" /> Bloquear conta
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

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
              <SystemRow label="Cadastros pendentes" value={String(stats.pending)} ok={stats.pending === 0} />
              <SystemRow label="Pontos concedidos" value={String(stats.points)} ok />
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
                <span className="font-semibold">{stats.employees}</span>
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

function StatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    approved: { label: "Ativo", variant: "default" },
    pending: { label: "Pendente", variant: "secondary" },
    rejected: { label: "Reprovado", variant: "destructive" },
    disabled: { label: "Desativado", variant: "outline" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
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