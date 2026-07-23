import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Search,
  Trash2,
  Check,
  Info,
  UserPlus,
  ShieldCheck,
  Trophy,
  Clock,
  Gift,
  Baby,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  category: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const CATEGORY_META: Record<string, { label: string; icon: any; tone: string }> = {
  info: { label: "Informação", icon: Info, tone: "text-muted-foreground bg-muted" },
  approval: { label: "Aprovações", icon: UserPlus, tone: "text-blue-600 bg-blue-500/10" },
  account: { label: "Conta", icon: ShieldCheck, tone: "text-emerald-600 bg-emerald-500/10" },
  role: { label: "Permissões", icon: ShieldCheck, tone: "text-purple-600 bg-purple-500/10" },
  user: { label: "Usuários", icon: Users, tone: "text-indigo-600 bg-indigo-500/10" },
  child: { label: "Crianças", icon: Baby, tone: "text-pink-600 bg-pink-500/10" },
  points: { label: "Pontuação", icon: Trophy, tone: "text-amber-600 bg-amber-500/10" },
  time: { label: "Banco de horas", icon: Clock, tone: "text-cyan-600 bg-cyan-500/10" },
  reward: { label: "Recompensas", icon: Gift, tone: "text-rose-600 bg-rose-500/10" },
  alert: { label: "Alertas", icon: AlertTriangle, tone: "text-destructive bg-destructive/10" },
};

const metaFor = (cat: string) => CATEGORY_META[cat] ?? CATEGORY_META.info;

function groupByDate(items: Notification[]) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  const startWeek = startToday - 6 * 86400000;

  const groups: Record<string, Notification[]> = {
    Hoje: [],
    Ontem: [],
    "Esta semana": [],
    Anteriores: [],
  };
  for (const n of items) {
    const t = new Date(n.created_at).getTime();
    if (t >= startToday) groups.Hoje.push(n);
    else if (t >= startYesterday) groups.Ontem.push(n);
    else if (t >= startWeek) groups["Esta semana"].push(n);
    else groups.Anteriores.push(n);
  }
  return groups;
}

export function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [pulse, setPulse] = useState(false);

  const unread = items.filter((n) => !n.read_at).length;

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setItems((data ?? []) as Notification[]);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setItems((prev) => [payload.new as Notification, ...prev].slice(0, 100));
          setPulse(true);
          setTimeout(() => setPulse(false), 700);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setItems((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setItems((prev) => prev.filter((x) => x.id !== (payload.old as any).id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markOneRead = async (id: string) => {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  };

  const markAllRead = async () => {
    if (!user) return;
    const now = new Date().toISOString();
    setItems((p) => p.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .is("read_at", null)
      .eq("user_id", user.id);
  };

  const removeOne = async (id: string) => {
    setItems((p) => p.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const clearAll = async () => {
    if (!user) return;
    setItems([]);
    await supabase.from("notifications").delete().eq("user_id", user.id);
  };

  const openItem = async (n: Notification) => {
    if (!n.read_at) await markOneRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const categories = useMemo(() => {
    const s = new Set<string>();
    items.forEach((n) => s.add(n.category));
    return Array.from(s);
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) || (n.body ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, category]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="relative min-h-11 min-w-11"
        >
          <Bell className={cn("h-5 w-5", pulse && "animate-[wiggle_0.6s_ease-in-out]")} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground animate-scale-in">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
        <div className="border-b p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Tudo em dia"}
              </p>
            </div>
            <div className="flex gap-1">
              {unread > 0 && (
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs" onClick={markAllRead}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  Ler tudo
                </Button>
              )}
              {items.length > 0 && (
                <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-destructive hover:text-destructive" onClick={clearAll}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {metaFor(c).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[420px]">
          {filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            <div className="p-2">
              {(["Hoje", "Ontem", "Esta semana", "Anteriores"] as const).map((label) =>
                grouped[label].length === 0 ? null : (
                  <div key={label} className="mb-3">
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <ul className="space-y-1">
                      {grouped[label].map((n) => {
                        const meta = metaFor(n.category);
                        const Icon = meta.icon;
                        const d = new Date(n.created_at);
                        return (
                          <li
                            key={n.id}
                            className={cn(
                              "group relative flex gap-3 rounded-md p-2 transition animate-fade-in",
                              !n.read_at ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted"
                            )}
                          >
                            <button
                              onClick={() => openItem(n)}
                              className="flex flex-1 gap-3 text-left"
                            >
                              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", meta.tone)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={cn("truncate text-sm", !n.read_at && "font-semibold")}>
                                    {n.title}
                                  </p>
                                  {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                                </div>
                                {n.body && (
                                  <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                                )}
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <Badge variant="outline" className="h-4 px-1 text-[9px]">
                                    {meta.label}
                                  </Badge>
                                  <span>
                                    {d.toLocaleDateString("pt-BR")} · {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  <span className={cn("ml-auto", !n.read_at ? "text-primary" : "")}>
                                    {n.read_at ? "Lida" : "Não lida"}
                                  </span>
                                </div>
                              </div>
                            </button>
                            <div className="flex flex-col items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100">
                              {!n.read_at && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  aria-label="Marcar como lida"
                                  onClick={() => markOneRead(n.id)}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                aria-label="Excluir notificação"
                                onClick={() => removeOne(n.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}