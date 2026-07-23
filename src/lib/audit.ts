import { supabase } from "@/integrations/supabase/client";

function detectDevice(ua: string): string {
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return "Mobile";
  if (/Tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

let cachedIp: string | null = null;
async function getIp(): Promise<string | null> {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const j = await res.json();
    cachedIp = j.ip ?? null;
    return cachedIp;
  } catch {
    return null;
  }
}

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const device = detectDevice(ua);
    const ip = await getIp();
    await supabase.rpc("log_audit_event", {
      _action: params.action,
      _entity: params.entity,
      _entity_id: params.entityId ?? null,
      _metadata: (params.metadata ?? {}) as never,
      _ip: ip,
      _user_agent: ua,
      _device: device,
    });
  } catch {
    // best-effort audit
  }
}