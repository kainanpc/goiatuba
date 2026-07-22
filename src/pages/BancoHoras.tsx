import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  Plus,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users as UsersIcon,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type EntryType = "extra" | "plantao" | "feriado" | "folga_usada" | "ajuste";

interface TimeEntry {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: EntryType;
  hours: number;
  description: string | null;
  created_at: string;
}

const TYPE_META: Record<
  EntryType,
  { label: string; sign: 1 | -1; tone: string; icon: typeof TrendingUp }
> = {
  extra: { label: "Horas extras", sign: 1, tone: "text-success", icon: TrendingUp },
  plantao: { label: "Plantão", sign: 1, tone: "text-success", icon: TrendingUp },
  feriado: { label: "Feriado trabalhado", sign: 1, tone: "text-success", icon: TrendingUp },
  folga_usada: { label: "Folga utilizada", sign: -1, tone: "text-warning", icon: TrendingDown },
  ajuste: { label: "Ajuste manual", sign: 1, tone: "text-muted-foreground", icon: Clock },
};

function fmtHours(h: number) {
  const sign = h < 0 ? "-" : "";
  const abs = Math.abs(h);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  return `${sign}${hh}h${mm > 0 ? ` ${mm}min` : ""}`;
}

function balanceOf(entries: TimeEntry[]) {
  return entries.reduce((s, e) => {
    const meta = TYPE_META[e.entry_type];
    return s + Number(e.hours) * meta.sign;
  }, 0);
}

export default function BancoHoras() {
  const { user, role } = useAuth();
  const isAdmin = role === "owner" || role === "admin";

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [scope, setScope] = useState<"mine" | "all">("mine");

  useEffect(() => {
    document.title = "Banco de Horas · SCFV";
  }, []);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    const query = supabase.from("time_entries").select("*").order("entry_date", { ascending: false });
    const filtered = scope === "mine" || !isAdmin ? query.eq("user_id", user.id) : query;
    const [e, p] = await Promise.all([
      filtered,
      supabase.from("profiles").select("id, full_name"),
    ]);
    if (e.error) toast.error("Erro ao carregar", { description: e.error.message });
    setEntries((e.data as TimeEntry[]) ?? []);
    const map: Record<string, string> = {};
    ((p.data as { id: string; full_name: string | null }[]) ?? []).forEach((r) => {
      map[r.id] = r.full_name ?? "Funcionário(a)";
    });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, scope]);

  const myEntries = useMemo(
    () => entries.filter((e) => e.user_id === user?.id),
    [entries, user],
  );
  const myBalance = useMemo(() => balanceOf(myEntries), [myEntries]);

  const monthBalance = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return balanceOf(myEntries.filter((e) => e.entry_date.startsWith(ym)));
  }, [myEntries]);

  const totalPositive = myEntries
    .filter((e) => TYPE_META[e.entry_type].sign === 1)
    .reduce((s, e) => s + Number(e.hours), 0);
  const totalNegative = myEntries
    .filter((e) => TYPE_META[e.entry_type].sign === -1)
    .reduce((s, e) => s + Number(e.hours), 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Módulo
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Banco de Horas</h1>
          <p className="text-sm text-muted-foreground">
            Registre plantões, horas extras, feriados e folgas utilizadas.
          </p>
        </div>
        <NewEntryDialog userId={user?.id} onCreated={loadAll} />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BalanceCard
          label="Saldo atual"
          value={fmtHours(myBalance)}
          tone={myBalance >= 0 ? "text-success" : "text-destructive"}
          icon={Clock}
        />
        <BalanceCard
          label="No mês atual"
          value={fmtHours(monthBalance)}
          tone={monthBalance >= 0 ? "text-success" : "text-destructive"}
          icon={Calendar}
        />
        <BalanceCard
          label="Créditos totais"
          value={fmtHours(totalPositive)}
          tone="text-success"
          icon={TrendingUp}
        />
        <BalanceCard
          label="Folgas usadas"
          value={fmtHours(totalNegative)}
          tone="text-warning"
          icon={TrendingDown}
        />
      </div>

      <Tabs value={scope} onValueChange={(v) => setScope(v as "mine" | "all")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="mine">Meus registros</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="all">
              <UsersIcon className="mr-1 h-4 w-4" /> Toda equipe
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={scope}>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <div className="font-semibold">Nenhum registro ainda</div>
                <div className="text-sm text-muted-foreground">
                  Registre o primeiro plantão, hora extra ou folga.
                </div>
              </CardContent>
            </Card>
          ) : scope === "all" ? (
            <TeamGrouped entries={entries} profiles={profiles} onDeleted={loadAll} />
          ) : (
            <EntryList
              entries={entries}
              profiles={profiles}
              showUser={false}
              onDeleted={loadAll}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: string;
  icon: typeof Clock;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`truncate text-xl font-bold ${tone}`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamGrouped({
  entries,
  profiles,
  onDeleted,
}: {
  entries: TimeEntry[];
  profiles: Record<string, string>;
  onDeleted: () => void;
}) {
  const grouped = useMemo(() => {
    const g: Record<string, TimeEntry[]> = {};
    entries.forEach((e) => {
      (g[e.user_id] ??= []).push(e);
    });
    return Object.entries(g).sort((a, b) =>
      (profiles[a[0]] ?? "").localeCompare(profiles[b[0]] ?? ""),
    );
  }, [entries, profiles]);

  return (
    <div className="space-y-4">
      {grouped.map(([uid, list]) => {
        const bal = balanceOf(list);
        return (
          <Card key={uid}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">{profiles[uid] ?? "Funcionário(a)"}</CardTitle>
              <Badge
                variant="secondary"
                className={bal >= 0 ? "text-success" : "text-destructive"}
              >
                Saldo: {fmtHours(bal)}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <EntryList
                entries={list}
                profiles={profiles}
                showUser={false}
                onDeleted={onDeleted}
                compact
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EntryList({
  entries,
  profiles: _profiles,
  showUser,
  onDeleted,
  compact,
}: {
  entries: TimeEntry[];
  profiles: Record<string, string>;
  showUser: boolean;
  onDeleted: () => void;
  compact?: boolean;
}) {
  const { user, role } = useAuth();
  const isAdmin = role === "owner" || role === "admin";

  const remove = async (id: string) => {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) toast.error("Erro ao remover", { description: error.message });
    else {
      toast.success("Registro removido");
      onDeleted();
    }
  };

  return (
    <Card className={compact ? "border-0 shadow-none" : undefined}>
      {!compact && (
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0" : "p-0"}>
        <ScrollArea className={compact ? "max-h-80" : "h-[520px]"}>
          <ul className="divide-y">
            {entries.map((e) => {
              const meta = TYPE_META[e.entry_type];
              const canDelete = isAdmin || e.user_id === user?.id;
              const signed = Number(e.hours) * meta.sign;
              return (
                <li key={e.id} className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                    <meta.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{meta.label}</span>
                      <Badge variant="secondary" className={meta.tone}>
                        {signed >= 0 ? "+" : ""}
                        {fmtHours(signed)}
                      </Badge>
                    </div>
                    {e.description && (
                      <div className="mt-1 text-sm text-muted-foreground">{e.description}</div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(e.entry_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      {showUser && ` · ${_profiles[e.user_id] ?? ""}`}
                    </div>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(e.id)}
                      aria-label="Remover"
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

function NewEntryDialog({
  userId,
  onCreated,
}: {
  userId: string | undefined;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    entry_type: "extra" as EntryType,
    hours: 1,
    entry_date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const submit = async () => {
    if (!userId) return;
    if (!Number.isFinite(form.hours) || form.hours <= 0) {
      toast.error("Informe uma quantidade de horas válida.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("time_entries").insert({
      user_id: userId,
      created_by: userId,
      entry_type: form.entry_type,
      hours: form.hours,
      entry_date: form.entry_date,
      description: form.description.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível registrar", { description: error.message });
      return;
    }
    toast.success("Registro adicionado!");
    setForm({ ...form, hours: 1, description: "" });
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo registro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo registro de horas</DialogTitle>
          <DialogDescription>
            Registros positivos somam ao saldo; folgas utilizadas subtraem.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Tipo *</Label>
            <Select
              value={form.entry_type}
              onValueChange={(v) => setForm({ ...form, entry_type: v as EntryType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_META) as EntryType[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {TYPE_META[k].label} {TYPE_META[k].sign < 0 ? "(desconta)" : "(soma)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Horas *</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={form.entry_date}
              onChange={(e) => setForm({ ...form, entry_date: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea
              id="desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={400}
              placeholder="Ex.: Plantão de sábado no CRAS Central."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}