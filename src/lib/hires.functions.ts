import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const upsertConfigInput = z.object({
  agentId: z.string().min(1).max(64),
  brief: z.string().max(5000).default(""),
  fields: z.record(z.string(), z.string().max(10000)).default({}),
  priceCents: z.number().int().min(0).max(1_000_000),
  hireId: z.string().uuid().optional(),
});

export const upsertDraftHire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => upsertConfigInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let hireId = data.hireId;

    if (hireId) {
      const { error } = await supabase
        .from("hires")
        .update({ brief: data.brief, price_cents: data.priceCents })
        .eq("id", hireId)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await supabase
        .from("hires")
        .insert({
          user_id: userId,
          agent_id: data.agentId,
          brief: data.brief,
          price_cents: data.priceCents,
          status: "setting_up",
        })
        .select("id")
        .single();
      if (error || !row) throw new Error(error?.message ?? "Could not create hire");
      hireId = row.id;
    }

    const { error: cfgError } = await supabase
      .from("agent_configs")
      .upsert({
        hire_id: hireId,
        user_id: userId,
        fields: data.fields,
        updated_at: new Date().toISOString(),
      });
    if (cfgError) throw new Error(cfgError.message);

    return { hireId };
  });

export const listMyHires = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: hires, error } = await supabase
      .from("hires")
      .select("id, agent_id, status, brief, price_cents, started_at, canceled_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: connections } = await supabase
      .from("agent_connections")
      .select("hire_id, provider, status, external_account")
      .eq("user_id", userId);

    return { hires: hires ?? [], connections: connections ?? [] };
  });

export const getMyDraftForAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ agentId: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("hires")
      .select("id, brief, agent_configs(fields)")
      .eq("user_id", userId)
      .eq("agent_id", data.agentId)
      .in("status", ["setting_up", "active", "paused"])
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const row = rows?.[0];
    if (!row) return { hireId: null, brief: "", fields: {} as Record<string, string> };
    const cfg = Array.isArray(row.agent_configs) ? row.agent_configs[0] : row.agent_configs;
    return {
      hireId: row.id as string,
      brief: (row.brief as string) ?? "",
      fields: ((cfg?.fields as Record<string, string>) ?? {}),
    };
  });

export const updateHireStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      hireId: z.string().uuid(),
      status: z.enum(["setting_up", "active", "paused", "canceled"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { status: typeof data.status; canceled_at?: string } = { status: data.status };
    if (data.status === "canceled") patch.canceled_at = new Date().toISOString();
    const { error } = await supabase
      .from("hires")
      .update(patch)
      .eq("id", data.hireId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setConnectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      hireId: z.string().uuid(),
      provider: z.string().min(1).max(64),
      status: z.enum(["pending", "connected", "disconnected", "error"]),
      externalAccount: z.string().max(255).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("agent_connections")
      .upsert(
        {
          hire_id: data.hireId,
          user_id: userId,
          provider: data.provider,
          status: data.status,
          external_account: data.externalAccount ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "hire_id,provider" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getConnectionsForHire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ hireId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("agent_connections")
      .select("provider, status, external_account")
      .eq("hire_id", data.hireId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { connections: rows ?? [] };
  });