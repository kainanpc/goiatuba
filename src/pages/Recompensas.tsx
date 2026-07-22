import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gift,
  Medal,
  Plus,
  LoaderCircle,
  ShoppingBag,
  Award,
  Sparkles,
  Star,
  Trophy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const ICONS: Record<string, any> = { Medal, Award, Sparkles, Star, Trophy };

interface Reward {
  id: string;
  name: string;
  description: string | null;
  cost_points: number;
  stock: number | null;
  active: boolean;
}
interface BadgeItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  required_points: number;
  active: boolean;
}
interface Child {
  id: string;
  full_name: string;
}
interface Redemption {
  id: string;
  child_id: string;
  reward_id: string;
  points_spent: number;
  notes: string | null;
  redeemed_at: string;
}

export default function Recompensas() {
  const { user, role } = useAuth();
  const canManage = role === "admin" || role === "owner";
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [childBadges, setChildBadges] = useState<{ child_id: string; badge_id: string }[]>([]);
  const [pointsByChild, setPointsByChild] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "Recompensas · SCFV";
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const [r, b, c, red, cb, pts] = await Promise.all([
      supabase.from("rewards").select("*").order("cost_points"),
      supabase.from("badges").select("*").order("required_points"),
      supabase.from("children").select("id, full_name").order("full_name"),
      supabase.from("reward_redemptions").select("*").order("redeemed_at", { ascending: false }).limit(100),
      supabase.from("child_badges").select("child_id, badge_id"),
      supabase.from("point_entries").select("child_id, points"),
    ]);
    setRewards((r.data ?? []) as Reward[]);
    setBadges((b.data ?? []) as BadgeItem[]);
    setChildren((c.data ?? []) as Child[]);
    setRedemptions((red.data ?? []) as Redemption[]);
    setChildBadges((cb.data ?? []) as any);

    const pointsMap: Record<string, number> = {};
    (pts.data ?? []).forEach((p: any) => {
      pointsMap[p.child_id] = (pointsMap[p.child_id] ?? 0) + p.points;
    });
    // subtract redemptions
    (red.data ?? []).forEach((r: any) => {
      pointsMap[r.child_id] = (pointsMap[r.child_id] ?? 0) - r.points_spent;
    });
    setPointsByChild(pointsMap);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Gift className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recompensas & Medalhas</h1>
          <p className="text-sm text-muted-foreground">
            Lojinha de trocas de pontos e sistema de medalhas por conquistas.
          </p>
        </div>
      </header>

      <Tabs defaultValue="loja">
        <TabsList>
          <TabsTrigger value="loja">Lojinha</TabsTrigger>
          <TabsTrigger value="medalhas">Medalhas</TabsTrigger>
          <TabsTrigger value="historico">Histórico de trocas</TabsTrigger>
        </TabsList>

        <TabsContent value="loja">
          <StoreTab
            rewards={rewards}
            children={children}
            pointsByChild={pointsByChild}
            canManage={canManage}
            userId={user?.id}
            onChange={load}
          />
        </TabsContent>

        <TabsContent value="medalhas">
          <BadgesTab
            badges={badges}
            children={children}
            pointsByChild={pointsByChild}
            childBadges={childBadges}
            canManage={canManage}
            userId={user?.id}
            onChange={load}
          />
        </TabsContent>

        <TabsContent value="historico">
          <HistoryTab
            redemptions={redemptions}
            rewards={rewards}
            children={children}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============ STORE ============ */
function StoreTab({
  rewards, children, pointsByChild, canManage, userId, onChange,
}: {
  rewards: Reward[]; children: Child[]; pointsByChild: Record<string, number>;
  canManage: boolean; userId?: string; onChange: () => void;
}) {
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nova recompensa</Button>
            </DialogTrigger>
            <RewardFormDialog onDone={() => { setCreating(false); onChange(); }} />
          </Dialog>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.filter(r => r.active).map((r) => (
          <Card key={r.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="rounded-lg bg-accent/10 p-2 text-accent">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <Badge variant="secondary">{r.cost_points} pts</Badge>
            </div>
            <h3 className="mt-3 font-semibold">{r.name}</h3>
            {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
            {r.stock !== null && (
              <p className="mt-2 text-xs text-muted-foreground">Estoque: {r.stock}</p>
            )}
            <div className="mt-4 flex gap-2">
              <RedeemDialog reward={r} children={children} pointsByChild={pointsByChild} userId={userId} onDone={onChange} />
              {canManage && <DeleteRewardButton id={r.id} onDone={onChange} />}
            </div>
          </Card>
        ))}
        {rewards.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Nenhuma recompensa cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}

function RewardFormDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(50);
  const [stock, setStock] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return toast.error("Informe o nome");
    setSaving(true);
    const { error } = await supabase.from("rewards").insert({
      name, description: description || null, cost_points: cost,
      stock: stock ? Number(stock) : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Recompensa criada");
    onDone();
  }
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova recompensa</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Custo (pontos)</Label><Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
          <div><Label>Estoque (opcional)</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={save} disabled={saving}>
          {saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Criar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function DeleteRewardButton({ id, onDone }: { id: string; onDone: () => void }) {
  async function del() {
    if (!confirm("Remover esta recompensa?")) return;
    const { error } = await supabase.from("rewards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removida");
    onDone();
  }
  return (
    <Button variant="ghost" size="icon" onClick={del} aria-label="Remover">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function RedeemDialog({
  reward, children, pointsByChild, userId, onDone,
}: {
  reward: Reward; children: Child[]; pointsByChild: Record<string, number>;
  userId?: string; onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [childId, setChildId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const balance = childId ? pointsByChild[childId] ?? 0 : 0;
  const insufficient = childId && balance < reward.cost_points;

  async function submit() {
    if (!childId) return toast.error("Selecione a criança");
    if (insufficient) return toast.error("Pontos insuficientes");
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("reward_redemptions").insert({
      child_id: childId, reward_id: reward.id, points_spent: reward.cost_points,
      notes: notes || null, redeemed_by: userId,
    });
    if (!error && reward.stock !== null) {
      await supabase.from("rewards").update({ stock: Math.max(0, reward.stock - 1) }).eq("id", reward.id);
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Troca registrada");
    setOpen(false); setChildId(""); setNotes("");
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="flex-1" size="sm">Trocar</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Trocar por {reward.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Criança</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name} · {pointsByChild[c.id] ?? 0} pts
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {childId && (
            <p className={`text-sm ${insufficient ? "text-destructive" : "text-muted-foreground"}`}>
              Saldo: {balance} pts · Custo: {reward.cost_points} pts
              {insufficient && " — insuficiente"}
            </p>
          )}
          <div><Label>Observações</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving || !childId || !!insufficient}>
            {saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Confirmar troca
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============ BADGES ============ */
function BadgesTab({
  badges, children, pointsByChild, childBadges, canManage, userId, onChange,
}: {
  badges: BadgeItem[]; children: Child[]; pointsByChild: Record<string, number>;
  childBadges: { child_id: string; badge_id: string }[]; canManage: boolean;
  userId?: string; onChange: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [selectedChild, setSelectedChild] = useState("");

  const grantedFor = useMemo(() => {
    const s = new Set<string>();
    childBadges.filter((cb) => cb.child_id === selectedChild).forEach((cb) => s.add(cb.badge_id));
    return s;
  }, [childBadges, selectedChild]);

  async function grant(badgeId: string) {
    if (!selectedChild || !userId) return;
    const { error } = await supabase.from("child_badges").insert({
      child_id: selectedChild, badge_id: badgeId, awarded_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Medalha concedida");
    onChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[240px] flex-1">
          <Label className="text-xs">Ver medalhas de:</Label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger><SelectValue placeholder="Selecionar criança..." /></SelectTrigger>
            <SelectContent>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Nova medalha</Button>
            </DialogTrigger>
            <BadgeFormDialog onDone={() => { setCreating(false); onChange(); }} />
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => {
          const Icon = ICONS[b.icon] ?? Medal;
          const granted = grantedFor.has(b.id);
          const balance = selectedChild ? pointsByChild[selectedChild] ?? 0 : 0;
          const eligible = selectedChild && balance >= b.required_points;
          return (
            <Card key={b.id} className={`p-5 ${granted ? "border-primary/60 bg-primary/5" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-3 ${granted ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">≥ {b.required_points} pontos</p>
                </div>
              </div>
              {b.description && <p className="mt-3 text-sm text-muted-foreground">{b.description}</p>}
              {selectedChild && (
                <div className="mt-3">
                  {granted ? (
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/20">Conquistada</Badge>
                  ) : (
                    <Button size="sm" disabled={!eligible} onClick={() => grant(b.id)} className="w-full">
                      {eligible ? "Conceder medalha" : `Faltam ${b.required_points - balance} pts`}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BadgeFormDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Medal");
  const [points, setPoints] = useState(100);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return toast.error("Informe o nome");
    setSaving(true);
    const { error } = await supabase.from("badges").insert({
      name, description: description || null, icon, required_points: points,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Medalha criada");
    onDone();
  }

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Nova medalha</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Descrição</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Ícone</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(ICONS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Pontos necessários</Label><Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={save} disabled={saving}>
          {saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Criar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ============ HISTORY ============ */
function HistoryTab({
  redemptions, rewards, children,
}: { redemptions: Redemption[]; rewards: Reward[]; children: Child[] }) {
  const rewardMap = Object.fromEntries(rewards.map((r) => [r.id, r.name]));
  const childMap = Object.fromEntries(children.map((c) => [c.id, c.full_name]));
  return (
    <Card className="p-0">
      {redemptions.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma troca registrada.</p>
      ) : (
        <ul className="divide-y">
          {redemptions.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{childMap[r.child_id] ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {rewardMap[r.reward_id] ?? "—"} · {r.points_spent} pts
                </p>
                {r.notes && <p className="mt-1 text-xs italic text-muted-foreground">"{r.notes}"</p>}
              </div>
              <time className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(r.redeemed_at).toLocaleString("pt-BR")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}