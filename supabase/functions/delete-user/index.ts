import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  userId: z.string().uuid({ message: "userId inválido" }),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Não autorizado" }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: "Sessão inválida" }, 401);

    const callerId = claims.claims.sub as string;

    const admin = createClient(url, service);
    const { data: isOwner } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "owner",
    });
    if (!isOwner) return json({ error: "Apenas o Dono pode excluir contas" }, 403);

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const targetId = parsed.data.userId;
    if (targetId === callerId) return json({ error: "Você não pode excluir sua própria conta" }, 400);

    const { error: dErr } = await admin.auth.admin.deleteUser(targetId);
    if (dErr) return json({ error: dErr.message }, 400);

    await admin.from("audit_logs").insert({
      user_id: callerId,
      action: "user.delete",
      entity: "profiles",
      entity_id: targetId,
      metadata: { deleted_by: callerId },
    });

    return json({ success: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }

  function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});