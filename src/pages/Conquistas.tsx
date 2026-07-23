import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Trophy,
  Plus,
  Search,
  Users,
  Sparkles,
  History,
  Star,
  Award,
  Loader2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Child {
  id: string;
  full_name: string;
  birth_date: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  gender: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

interface Activity {
  id: string;
  name: string;
  description: string | null;
  default_points: number;
  category: string | null;
  active: boolean;
}

interface PointEntry {
  id: string;
  child_id: string;
  activity_id: string | null;
  awarded_by: string;
  points: number;
  reason: string | null;
  entry_date: string;
  created_at: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function ageFrom(date: string | null) {
  if (!date) return null;
  const b = new Date(date);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export default function Conquistas() {
  const { user, role } = useAuth();
  const canManage = role === "owner" || role === "admin";

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [entries, setEntries] = useState<PointEntry[]>([]);
  const [educators, setEducators] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    document.title = "Conquistas · SCFV";
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [c, a, e, p] = await Promise.all([
      supabase.from("children").select("*").order("full_name"),
      supabase.from("activities").select("*").eq("active", true).order("name"),
      supabase.from("point_entries").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("id, full_name"),
    ]);
    if (c.error) toast.error("Erro ao carregar crianças", { description: c.error.message });
    if (a.error) toast.error("Erro ao carregar atividades", { description: a.error.message });
    if (e.error) toast.error("Erro ao carregar pontuações", { description: e.error.message });
    setChildren((c.data as Child[]) ?? []);
    setActivities((a.data as Activity[]) ?? []);
    setEntries((e.data as PointEntry[]) ?? []);
    const map: Record<string, string> = {};
    ((p.data as { id: string; full_name: string | null }[]) ?? []).forEach((row) => {
      map[row.id] = row.full_name ?? "Educador(a)";
    });
    setEducators(map);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const totalsByChild = useMemo(() => {
    const t: Record<string, number> = {};
    entries.forEach((e) => {
      t[e.child_id] = (t[e.child_id] ?? 0) + e.points;
    });
    return t;
  }, [entries]);

  const filteredChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return children;
    return children.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.guardian_name?.toLowerCase().includes(q),
    );
  }, [children, search]);

  const stats = useMemo(() => {
    const totalPoints = entries.reduce((s, e) => s + e.points, 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = entries.filter((e) => e.entry_date === today).length;
    return {
      children: children.length,
      totalPoints,
      todayCount,
      activities: activities.length,
    };
  }, [entries, children, activities]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" /> Módulo
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Sistema de Conquistas</h1>
          <p className="text-sm text-muted-foreground">
            Caderneta virtual das crianças, pontos por educador e histórico completo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NewPointDialog
            children={children}
            activities={activities}
            userId={user?.id}
            onCreated={loadAll}
          />
          <NewChildDialog userId={user?.id} onCreated={loadAll} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Crianças" value={stats.children} />
        <StatCard icon={Star} label="Pontos concedidos" value={stats.totalPoints} />
        <StatCard icon={Sparkles} label="Registros hoje" value={stats.todayCount} />
        <StatCard icon={Award} label="Atividades" value={stats.activities} />
      </div>

      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children">Crianças</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou responsável..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : filteredChildren.length === 0 ? (
            <EmptyState
              title="Nenhuma criança cadastrada"
              description="Comece cadastrando a primeira criança do grupo."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredChildren.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  totalPoints={totalsByChild[child.id] ?? 0}
                  onClick={() => setSelectedChild(child)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <HistoryList
            entries={entries}
            children={children}
            activities={activities}
            educators={educators}
            currentUserId={user?.id}
            canManage={canManage}
            loading={loading}
            onDeleted={loadAll}
          />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesPanel
            activities={activities}
            canManage={canManage}
            userId={user?.id}
            onChange={loadAll}
          />
        </TabsContent>
      </Tabs>

      <ChildDetailDialog
        child={selectedChild}
        onClose={() => setSelectedChild(null)}
        entries={entries.filter((e) => e.child_id === selectedChild?.id)}
        activities={activities}
        educators={educators}
        totalPoints={selectedChild ? totalsByChild[selectedChild.id] ?? 0 : 0}
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Trophy className="h-10 w-10 text-muted-foreground" />
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  );
}

function ChildCard({
  child,
  totalPoints,
  onClick,
}: {
  child: Child;
  totalPoints: number;
  onClick: () => void;
}) {
  const age = ageFrom(child.birth_date);
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-xl border bg-card p-4 shadow-card-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials(child.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{child.full_name}</div>
          <div className="text-xs text-muted-foreground">
            {age !== null ? `${age} anos` : "Idade não informada"}
            {child.guardian_name ? ` · ${child.guardian_name}` : ""}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              {totalPoints} pts
            </Badge>
            {!child.active && <Badge variant="outline">Inativa</Badge>}
          </div>
        </div>
      </div>
    </button>
  );
}

function NewChildDialog({
  userId,
  onCreated,
}: {
  userId: string | undefined;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    guardian_name: "",
    guardian_phone: "",
    gender: "",
    notes: "",
  });

  const reset = () =>
    setForm({
      full_name: "",
      birth_date: "",
      guardian_name: "",
      guardian_phone: "",
      gender: "",
      notes: "",
    });

  const submit = async () => {
    if (!userId) return;
    if (form.full_name.trim().length < 2) {
      toast.error("Informe o nome completo da criança.");
      return;
    }
    if (!form.birth_date) {
      toast.error("Informe a data de nascimento da criança.");
      return;
    }
    const age = ageFrom(form.birth_date);
    if (age === null || age < 4 || age > 18) {
      toast.error("Idade fora do projeto", {
        description: "O SCFV atende crianças e adolescentes de 4 a 18 anos.",
      });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("children").insert({
      full_name: form.full_name.trim(),
      birth_date: form.birth_date || null,
      guardian_name: form.guardian_name.trim() || null,
      guardian_phone: form.guardian_phone.trim() || null,
      gender: form.gender || null,
      notes: form.notes.trim() || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível cadastrar", { description: error.message });
      return;
    }
    toast.success("Criança cadastrada com sucesso!");
    reset();
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Nova criança
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar criança</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos. Você pode editar depois.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full_name">Nome completo *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de nascimento *</Label>
            <Input
              id="birth_date"
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              max={new Date().toISOString().slice(0, 10)}
            />
            <p className="text-xs text-muted-foreground">
              O SCFV atende crianças e adolescentes de 4 a 18 anos.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gênero</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardian_name">Responsável</Label>
            <Input
              id="guardian_name"
              value={form.guardian_name}
              onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardian_phone">Telefone</Label>
            <Input
              id="guardian_phone"
              value={form.guardian_phone}
              onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
              maxLength={30}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              maxLength={500}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewPointDialog({
  children,
  activities,
  userId,
  onCreated,
  presetChildId,
}: {
  children: Child[];
  activities: Activity[];
  userId: string | undefined;
  onCreated: () => void;
  presetChildId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [childId, setChildId] = useState(presetChildId ?? "");
  const [activityId, setActivityId] = useState<string>("");
  const [points, setPoints] = useState<number>(10);
  const [reason, setReason] = useState("");
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open && presetChildId) setChildId(presetChildId);
  }, [open, presetChildId]);

  const onActivityChange = (id: string) => {
    setActivityId(id);
    const act = activities.find((a) => a.id === id);
    if (act) setPoints(act.default_points);
  };

  const submit = async () => {
    if (!userId) return;
    if (!childId) {
      toast.error("Selecione a criança.");
      return;
    }
    if (!Number.isFinite(points) || points === 0) {
      toast.error("Informe uma pontuação válida.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("point_entries").insert({
      child_id: childId,
      activity_id: activityId || null,
      awarded_by: userId,
      points,
      reason: reason.trim() || null,
      entry_date: entryDate,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível registrar", { description: error.message });
      return;
    }
    toast.success("Pontuação registrada!");
    setReason("");
    setActivityId("");
    setPoints(10);
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Registrar pontos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pontuação</DialogTitle>
          <DialogDescription>
            Reconheça uma conquista da criança. Ficará registrado no histórico.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Criança *</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a criança" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Atividade / Conquista</Label>
            <Select value={activityId} onValueChange={onActivityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma atividade (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} · {a.default_points} pts
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pts">Pontos *</Label>
            <Input
              id="pts"
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="reason">Motivo / observação</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="Descreva brevemente por que a pontuação foi concedida."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoryList({
  entries,
  children,
  activities,
  educators,
  currentUserId,
  canManage,
  loading,
  onDeleted,
}: {
  entries: PointEntry[];
  children: Child[];
  activities: Activity[];
  educators: Record<string, string>;
  currentUserId: string | undefined;
  canManage: boolean;
  loading: boolean;
  onDeleted: () => void;
}) {
  const childMap = useMemo(() => Object.fromEntries(children.map((c) => [c.id, c])), [children]);
  const activityMap = useMemo(
    () => Object.fromEntries(activities.map((a) => [a.id, a])),
    [activities],
  );

  const remove = async (id: string) => {
    const { error } = await supabase.from("point_entries").delete().eq("id", id);
    if (error) toast.error("Erro ao remover", { description: error.message });
    else {
      toast.success("Registro removido");
      onDeleted();
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nenhuma pontuação registrada"
        description="Use “Registrar pontos” para reconhecer as conquistas."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" /> Últimos registros
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          <ul className="divide-y">
            {entries.map((e) => {
              const child = childMap[e.child_id];
              const activity = e.activity_id ? activityMap[e.activity_id] : null;
              const canDelete = canManage || e.awarded_by === currentUserId;
              return (
                <li key={e.id} className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {child?.full_name ?? "Criança removida"}
                      </span>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" /> {e.points} pts
                      </Badge>
                      {activity && <Badge variant="outline">{activity.name}</Badge>}
                    </div>
                    {e.reason && (
                      <div className="mt-1 text-sm text-muted-foreground">{e.reason}</div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(e.entry_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}{" "}
                      · por {educators[e.awarded_by] ?? "Educador(a)"}
                    </div>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(e.id)}
                      aria-label="Remover registro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivitiesPanel({
  activities,
  canManage,
  userId,
  onChange,
}: {
  activities: Activity[];
  canManage: boolean;
  userId: string | undefined;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", default_points: 10, category: "" });

  const submit = async () => {
    if (!userId) return;
    if (form.name.trim().length < 2) {
      toast.error("Informe o nome da atividade.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("activities").insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      default_points: Number(form.default_points) || 0,
      category: form.category.trim() || null,
      created_by: userId,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível criar", { description: error.message });
      return;
    }
    toast.success("Atividade criada!");
    setForm({ name: "", description: "", default_points: 10, category: "" });
    setOpen(false);
    onChange();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("activities").update({ active: false }).eq("id", id);
    if (error) toast.error("Erro", { description: error.message });
    else {
      toast.success("Atividade arquivada");
      onChange();
    }
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova atividade</DialogTitle>
                <DialogDescription>
                  Cadastre uma conquista com pontuação padrão.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={80}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Pontos padrão</Label>
                    <Input
                      type="number"
                      value={form.default_points}
                      onChange={(e) =>
                        setForm({ ...form, default_points: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      maxLength={40}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    maxLength={300}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activities.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade ativa"
          description="Cadastre atividades para padronizar as pontuações."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{a.name}</div>
                    {a.category && (
                      <Badge variant="outline" className="mt-1">
                        {a.category}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" /> {a.default_points}
                  </Badge>
                </div>
                {a.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                )}
                {canManage && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(a.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Arquivar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ChildDetailDialog({
  child,
  onClose,
  entries,
  activities,
  educators,
  totalPoints,
}: {
  child: Child | null;
  onClose: () => void;
  entries: PointEntry[];
  activities: Activity[];
  educators: Record<string, string>;
  totalPoints: number;
}) {
  const activityMap = useMemo(
    () => Object.fromEntries(activities.map((a) => [a.id, a])),
    [activities],
  );
  const age = ageFrom(child?.birth_date ?? null);
  return (
    <Dialog open={!!child} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {child && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {initials(child.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>{child.full_name}</DialogTitle>
                  <DialogDescription>
                    {age !== null ? `${age} anos` : "Idade não informada"}
                    {child.guardian_name ? ` · Resp.: ${child.guardian_name}` : ""}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoTile label="Total de pontos" value={`${totalPoints}`} />
              <InfoTile label="Registros" value={`${entries.length}`} />
              <InfoTile label="Telefone" value={child.guardian_phone ?? "—"} />
              <InfoTile label="Gênero" value={child.gender ?? "—"} />
            </div>

            {child.notes && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="mb-1 text-xs font-medium text-muted-foreground">Observações</div>
                {child.notes}
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4" /> Histórico de conquistas
              </div>
              {entries.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Ainda não há pontuações registradas para esta criança.
                </div>
              ) : (
                <ScrollArea className="max-h-72 rounded-lg border">
                  <ul className="divide-y">
                    {entries.map((e) => {
                      const activity = e.activity_id ? activityMap[e.activity_id] : null;
                      return (
                        <li key={e.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3" /> {e.points}
                            </Badge>
                            {activity && <Badge variant="outline">{activity.name}</Badge>}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {format(new Date(e.entry_date), "dd/MM/yyyy")}
                            </span>
                          </div>
                          {e.reason && <div className="mt-1 text-sm">{e.reason}</div>}
                          <div className="mt-1 text-xs text-muted-foreground">
                            por {educators[e.awarded_by] ?? "Educador(a)"}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}