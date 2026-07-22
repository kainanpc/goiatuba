import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, Download, LoaderCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

interface PointRow {
  id: string;
  child_id: string;
  activity_id: string | null;
  educator_id: string | null;
  points: number;
  created_at: string;
}
interface TimeRow {
  id: string;
  user_id: string;
  type: string;
  hours: number;
  created_at: string;
}

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<PointRow[]>([]);
  const [times, setTimes] = useState<TimeRow[]>([]);
  const [children, setChildren] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Relatórios · SCFV";
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [p, t, c, a, u] = await Promise.all([
        supabase.from("point_entries").select("*").order("created_at", { ascending: true }),
        supabase.from("time_entries").select("*").order("created_at", { ascending: true }),
        supabase.from("children").select("id, full_name"),
        supabase.from("activities").select("id, name"),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      setPoints((p.data ?? []) as PointRow[]);
      setTimes((t.data ?? []) as TimeRow[]);
      setChildren(Object.fromEntries((c.data ?? []).map((r: any) => [r.id, r.full_name])));
      setActivities(Object.fromEntries((a.data ?? []).map((r: any) => [r.id, r.name])));
      setUsers(Object.fromEntries((u.data ?? []).map((r: any) => [r.id, r.full_name || r.email])));
    } catch (e: any) {
      toast.error("Erro ao carregar relatórios", { description: e.message });
    } finally {
      setLoading(false);
    }
  }

  const pointsByChild = useMemo(() => {
    const m = new Map<string, number>();
    points.forEach((p) => m.set(p.child_id, (m.get(p.child_id) ?? 0) + p.points));
    return [...m.entries()]
      .map(([id, v]) => ({ name: children[id] ?? "—", pontos: v }))
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 10);
  }, [points, children]);

  const pointsByActivity = useMemo(() => {
    const m = new Map<string, number>();
    points.forEach((p) => {
      const k = p.activity_id ?? "sem";
      m.set(k, (m.get(k) ?? 0) + p.points);
    });
    return [...m.entries()].map(([id, v]) => ({
      name: activities[id] ?? "Sem atividade",
      value: v,
    }));
  }, [points, activities]);

  const pointsOverTime = useMemo(() => {
    const m = new Map<string, number>();
    points.forEach((p) => {
      const d = new Date(p.created_at).toISOString().slice(0, 10);
      m.set(d, (m.get(d) ?? 0) + p.points);
    });
    return [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, pontos]) => ({ date: date.slice(5), pontos }));
  }, [points]);

  const hoursByUser = useMemo(() => {
    const m = new Map<string, number>();
    times.forEach((t) => {
      const sign = t.type === "folga" ? -1 : 1;
      m.set(t.user_id, (m.get(t.user_id) ?? 0) + sign * Number(t.hours));
    });
    return [...m.entries()]
      .map(([id, v]) => ({ name: users[id] ?? "—", horas: Number(v.toFixed(1)) }))
      .sort((a, b) => b.horas - a.horas);
  }, [times, users]);

  function exportCSV() {
    const rows = [
      ["Data", "Criança", "Atividade", "Educador", "Pontos"],
      ...points.map((p) => [
        new Date(p.created_at).toLocaleString("pt-BR"),
        children[p.child_id] ?? "",
        activities[p.activity_id ?? ""] ?? "",
        users[p.educator_id ?? ""] ?? "",
        String(p.points),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-pontos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPontos = points.reduce((s, p) => s + p.points, 0);
  const totalRegistros = points.length;
  const criancasAtivas = new Set(points.map((p) => p.child_id)).size;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-sm text-muted-foreground">
              Análises consolidadas de conquistas e banco de horas.
            </p>
          </div>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pontos totais" value={totalPontos} />
        <StatCard label="Registros" value={totalRegistros} />
        <StatCard label="Crianças ativas" value={criancasAtivas} />
      </div>

      <Tabs defaultValue="conquistas">
        <TabsList>
          <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
          <TabsTrigger value="horas">Banco de Horas</TabsTrigger>
        </TabsList>

        <TabsContent value="conquistas" className="space-y-6">
          <ChartCard title="Evolução de pontos (últimos 30 registros diários)" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={pointsOverTime}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="pontos" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Top 10 crianças por pontos">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pointsByChild} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={110} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="pontos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribuição por atividade">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pointsByActivity} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pointsByActivity.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="horas">
          <ChartCard title="Saldo de horas por funcionário">
            <ResponsiveContainer width="100%" height={Math.max(260, hoursByUser.length * 42)}>
              <BarChart data={hoursByUser} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={140} fontSize={11} />
                <Tooltip />
                <Bar dataKey="horas" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </Card>
  );
}