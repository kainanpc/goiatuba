import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  Search,
  ShieldCheck,
  Shield,
  User as UserIcon,
  Loader2,
  Pencil,
  Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role_title: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface RoleRow {
  user_id: string;
  role: AppRole;
}

const ROLE_META: Record<AppRole, { label: string; icon: typeof Shield; tone: string }> = {
  owner: { label: "Dono", icon: Crown, tone: "bg-primary/10 text-primary" },
  admin: { label: "Administrador", icon: ShieldCheck, tone: "bg-accent/15 text-accent" },
  employee: { label: "Funcionário", icon: UserIcon, tone: "bg-muted text-muted-foreground" },
};

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Funcionarios() {
  const { user, role: currentRole } = useAuth();
  const isOwner = currentRole === "owner";

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<EmployeeProfile[]>([]);
  const [roles, setRoles] = useState<Record<string, AppRole>>({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EmployeeProfile | null>(null);

  useEffect(() => {
    document.title = "Funcionários · SCFV";
  }, []);

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (p.error) toast.error("Erro ao carregar", { description: p.error.message });
    setProfiles((p.data as EmployeeProfile[]) ?? []);
    const map: Record<string, AppRole> = {};
    ((r.data as RoleRow[]) ?? []).forEach((row) => {
      const priority: Record<AppRole, number> = { owner: 1, admin: 2, employee: 3 };
      if (!map[row.user_id] || priority[row.role] < priority[map[row.user_id]]) {
        map[row.user_id] = row.role;
      }
    });
    setRoles(map);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.role_title?.toLowerCase().includes(q),
    );
  }, [profiles, search]);

  const stats = useMemo(() => {
    const counts = { owner: 0, admin: 0, employee: 0 } as Record<AppRole, number>;
    Object.values(roles).forEach((r) => {
      counts[r] += 1;
    });
    return counts;
  }, [roles]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> Módulo
        </div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Gestão de Funcionários</h1>
        <p className="text-sm text-muted-foreground">
          Visualize a equipe, edite informações e defina permissões.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Crown} label="Dono" value={stats.owner} />
        <StatCard icon={ShieldCheck} label="Administradores" value={stats.admin} />
        <StatCard icon={UserIcon} label="Funcionários" value={stats.employee} />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou cargo..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <EmployeeCard
              key={p.id}
              profile={p}
              role={roles[p.id] ?? "employee"}
              onEdit={() => setEditing(p)}
            />
          ))}
        </div>
      )}

      <EditDialog
        profile={editing}
        role={editing ? roles[editing.id] ?? "employee" : "employee"}
        canChangeRole={isOwner && editing?.id !== user?.id}
        onClose={() => setEditing(null)}
        onSaved={load}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmployeeCard({
  profile,
  role,
  onEdit,
}: {
  profile: EmployeeProfile;
  role: AppRole;
  onEdit: () => void;
}) {
  const meta = ROLE_META[role];
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">
              {profile.full_name ?? "Sem nome"}
            </div>
            <div className="truncate text-xs text-muted-foreground">{profile.email}</div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge className={meta.tone}>
                <meta.icon className="mr-1 h-3 w-3" />
                {meta.label}
              </Badge>
              {profile.role_title && <Badge variant="outline">{profile.role_title}</Badge>}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Desde {format(new Date(profile.created_at), "MMM/yyyy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" /> Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EditDialog({
  profile,
  role,
  canChangeRole,
  onClose,
  onSaved,
}: {
  profile: EmployeeProfile | null;
  role: AppRole;
  canChangeRole: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", role_title: "", phone: "", role });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        role_title: profile.role_title ?? "",
        phone: profile.phone ?? "",
        role,
      });
    }
  }, [profile, role]);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        role_title: form.role_title.trim() || null,
        phone: form.phone.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      setSaving(false);
      toast.error("Erro ao salvar", { description: error.message });
      return;
    }

    if (canChangeRole && form.role !== role) {
      const del = await supabase.from("user_roles").delete().eq("user_id", profile.id);
      if (del.error) {
        setSaving(false);
        toast.error("Erro ao atualizar papel", { description: del.error.message });
        return;
      }
      const ins = await supabase
        .from("user_roles")
        .insert({ user_id: profile.id, role: form.role });
      if (ins.error) {
        setSaving(false);
        toast.error("Erro ao atualizar papel", { description: ins.error.message });
        return;
      }
    }

    setSaving(false);
    toast.success("Alterações salvas!");
    onClose();
    onSaved();
  };

  return (
    <Dialog open={!!profile} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {profile && (
          <>
            <DialogHeader>
              <DialogTitle>Editar funcionário</DialogTitle>
              <DialogDescription>{profile.email}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome completo</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={form.role_title}
                  onChange={(e) => setForm({ ...form, role_title: e.target.value })}
                  maxLength={80}
                  placeholder="Ex.: Educador social"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={30}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Nível de acesso</Label>
                {canChangeRole ? (
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as AppRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="employee">Funcionário</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {ROLE_META[form.role].label}
                    <span className="text-xs">
                      · Apenas o Dono pode alterar permissões
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}