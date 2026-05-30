import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { AgentAvatar } from "@/components/agent-avatar";
import { findAgent, type ConfigField } from "@/lib/agents";
import { useAuth } from "@/lib/auth";
import {
  upsertDraftHire,
  getMyDraftForAgent,
  setConnectionStatus,
  getConnectionsForHire,
} from "@/lib/hires.functions";
import { Check, Link2 } from "lucide-react";

export const Route = createFileRoute("/agents/$id/configure")({
  loader: ({ params }) => {
    const agent = findAgent(params.id);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Configure ${loaderData?.agent.name} | WorkerBot` }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      Agent not found. <Link to="/agents" className="underline ml-2">Browse all</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-10 text-destructive">{error.message}</div>,
  component: Configure,
});

function Configure() {
  const { agent } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const upsert = useServerFn(upsertDraftHire);
  const getDraft = useServerFn(getMyDraftForAgent);
  const setConn = useServerFn(setConnectionStatus);
  const getConn = useServerFn(getConnectionsForHire);

  const [fields, setFields] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState("");
  const [hireId, setHireId] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const configFields = agent.configFields as ConfigField[];

  // Load existing draft for signed-in users
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const d = await getDraft({ data: { agentId: agent.id } });
        setFields(d.fields ?? {});
        setInstructions(d.brief ?? "");
        setHireId(d.hireId);
        if (d.hireId) {
          const c = await getConn({ data: { hireId: d.hireId } });
          const map: Record<string, boolean> = {};
          for (const row of c.connections) {
            if (row.status === "connected") map[row.provider] = true;
          }
          setConnected(map);
        }
      } catch {}
    })();
  }, [user, agent.id, getDraft, getConn]);

  const update = (k: string, v: string) => setFields((p) => ({ ...p, [k]: v }));

  const missingRequired = configFields.some((f) => {
    if (!f.required) return false;
    if (f.kind === "connect") return !connected[f.provider];
    return !fields[f.key]?.trim();
  });

  const handleConnect = async (provider: string) => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/agents/${agent.id}/configure` } });
      return;
    }
    // Ensure a draft hire exists so we can attach the connection
    let id = hireId;
    if (!id) {
      const res = await upsert({
        data: {
          agentId: agent.id,
          brief: instructions,
          fields,
          priceCents: agent.price * 100,
        },
      });
      id = res.hireId;
      setHireId(id);
    }
    // Stubbed OAuth — confirm and mark connected. Real OAuth wired later.
    const ok = window.confirm(
      `Connect ${provider}? (Demo: this skips the real OAuth handshake and marks the slot as connected.)`,
    );
    if (!ok) return;
    await setConn({
      data: {
        hireId: id!,
        provider,
        status: "connected",
        externalAccount: user.email ?? undefined,
      },
    });
    setConnected((p) => ({ ...p, [provider]: true }));
  };

  const handleDisconnect = async (provider: string) => {
    if (!hireId) return;
    await setConn({ data: { hireId, provider, status: "disconnected" } });
    setConnected((p) => ({ ...p, [provider]: false }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!user) {
      navigate({ to: "/login", search: { redirect: `/agents/${agent.id}/configure` } });
      return;
    }

    setSaving(true);
    try {
      const res = await upsert({
        data: {
          agentId: agent.id,
          brief: instructions,
          fields,
          priceCents: agent.price * 100,
          hireId: hireId ?? undefined,
        },
      });
      setHireId(res.hireId);
      navigate({ to: "/hired" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-6xl mx-auto">
        <Link
          to="/agents/$id"
          params={{ id: agent.id }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {agent.name}
        </Link>

        <div className="mt-8 flex items-center gap-5">
          <AgentAvatar seed={agent.avatarSeed} accent={agent.accent} size={72} />
          <div>
            <div className="text-sm text-muted-foreground">{agent.role}</div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Set up {agent.name}.
            </h1>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-muted-foreground">
          Payment confirmed — now connect the services {agent.name} needs and
          tell them what to focus on. The more specific, the better the first week.
        </p>

        {!user && !loading && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            You can fill this out, but you'll need to{" "}
            <Link to="/login" search={{ redirect: `/agents/${agent.id}/configure` }} className="underline text-foreground">sign in</Link>{" "}
            to save and continue to checkout.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-10 grid md:grid-cols-2 gap-6">
          <section className="rounded-3xl bg-card border border-border p-6">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
              Account details & connections
            </h2>
            <div className="mt-5 space-y-4">
              {configFields.map((f) => (
                <div key={f.key}>
                  {f.kind === "input" ? (
                    <>
                      <label className="text-sm font-medium" htmlFor={f.key}>
                        {f.label}
                        {f.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea
                          id={f.key}
                          value={fields[f.key] ?? ""}
                          onChange={(e) => update(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          rows={3}
                          className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40"
                        />
                      ) : (
                        <input
                          id={f.key}
                          type={f.type}
                          value={fields[f.key] ?? ""}
                          onChange={(e) => update(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40"
                        />
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">
                            {f.label}
                            {f.required && <span className="text-destructive ml-1">*</span>}
                          </div>
                          {f.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">{f.description}</div>
                          )}
                        </div>
                        {connected[f.provider] ? (
                          <button
                            type="button"
                            onClick={() => handleDisconnect(f.provider)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground text-xs px-3 py-1.5 hover:opacity-80"
                          >
                            <Check className="h-3 w-3" /> Connected
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConnect(f.provider)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-xs px-3 py-1.5 hover:opacity-90"
                          >
                            <Link2 className="h-3 w-3" /> Connect
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-card border border-border p-6 flex flex-col">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
              Brief for {agent.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell {agent.name} what you want them to focus on. Goals, do's and
              don'ts, examples, anything that helps them act like you would.
            </p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={`e.g. "Prioritize replies from existing customers. Never commit to meetings before 10am. Use a warm, concise tone."`}
              className="mt-4 flex-1 min-h-[260px] w-full rounded-xl bg-background border border-border px-3 py-3 text-sm leading-relaxed focus:outline-none focus:border-foreground/40 resize-none"
            />
          </section>

          <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-3xl bg-card border border-border p-5">
            <div>
              <div className="text-sm text-muted-foreground">Monthly</div>
              <div className="text-2xl font-light">
                ${agent.price}
                <span className="text-sm text-muted-foreground"> / mo</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {err && <span className="text-sm text-destructive">{err}</span>}
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : missingRequired ? "Save & finish later" : "Finish setup"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}