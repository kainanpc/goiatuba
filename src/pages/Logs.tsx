import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScrollText,
  Search,
  LoaderCircle,
  Monitor,
  Smartphone,
  Download,
  RefreshCw,
} from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: any;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  device: string | null;
}

export default function Logs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const [{ data: logsData }, { data: profs }] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    setLogs((logsData ?? []) as AuditLog[]);
    const map: Record<string, string> = {};
    (profs ?? []).forEach((p: any) => {
      map[p.id] = p.full_name ?? p.email ?? "—";
    });
    setUserMap(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("audit_logs_stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as AuditLog, ...prev].slice(0, 1000));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const entities = useMemo(() => {
    const s = new Set<string>();
    logs.forEach((l) => l.entity && s.add(l.entity));
    return Array.from(s).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (entityFilter !== "all" && l.entity !== entityFilter) return false;
      if (deviceFilter !== "all" && (l.device ?? "") !== deviceFilter) return false;
      if (!q) return true;
      const who = userMap[l.user_id ?? ""] ?? "";
      return (
        l.action.toLowerCase().includes(q) ||
        (l.entity ?? "").toLowerCase().includes(q) ||
        (l.ip_address ?? "").toLowerCase().includes(q) ||
        who.toLowerCase().includes(q)
      );
    });
  }, [logs, search, entityFilter, deviceFilter, userMap]);

  const exportCsv = () => {
    const header = [
      "data",
      "usuario",
      "acao",
      "entidade",
      "entity_id",
      "ip",
      "dispositivo",
      "user_agent",
    ];
    const rows = filtered.map((l) => [
      new Date(l.created_at).toISOString(),
      userMap[l.user_id ?? ""] ?? "Sistema",
      l.action,
      l.entity ?? "",
      l.entity_id ?? "",
      l.ip_address ?? "",
      l.device ?? "",
      (l.user_agent ?? "").replace(/[\r\n,]+/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ScrollText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Logs do Sistema</h1>
            <p className="text-sm text-muted-foreground">
              Trilha completa de auditoria — acesso exclusivo do Dono.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por ação, entidade, IP ou usuário"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas entidades</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Dispositivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Desktop">Desktop</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="Tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-3 text-xs text-muted-foreground">
          {filtered.length} de {logs.length} registros
        </div>

        <ScrollArea className="h-[560px] rounded-md border">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((log) => (
                <li key={log.id} className="px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {log.action}
                        </Badge>
                        {log.entity && (
                          <span className="text-xs text-muted-foreground">
                            em <span className="font-medium">{log.entity}</span>
                          </span>
                        )}
                        {log.device && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {log.device === "Mobile" ? (
                              <Smartphone className="h-3 w-3" />
                            ) : (
                              <Monitor className="h-3 w-3" />
                            )}
                            {log.device}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        por <span className="font-medium text-foreground">{userMap[log.user_id ?? ""] ?? "Sistema"}</span>
                        {log.entity_id ? ` · ref ${log.entity_id.slice(0, 8)}` : ""}
                        {log.ip_address ? ` · IP ${log.ip_address}` : ""}
                      </p>
                      {log.metadata && Object.keys(log.metadata ?? {}).length > 0 && (
                        <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted/50 p-2 text-[11px] leading-tight">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                    <time className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}