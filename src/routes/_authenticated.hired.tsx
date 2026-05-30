import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { AgentAvatar } from "@/components/agent-avatar";
import { listMyHires, updateHireStatus } from "@/lib/hires.functions";
import { findAgent } from "@/lib/agents";

type Hire = {
  id: string;
  agent_id: string;
  status: string;
  brief: string;
  price_cents: number;
  started_at: string;
  canceled_at: string | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/hired")({
  head: () => ({ meta: [{ title: "My Agents — WorkerBot" }] }),
  component: HiredPage,
});

function HiredPage() {
  const list = useServerFn(listMyHires);
  const setStatus = useServerFn(updateHireStatus);
  const [hires, setHires] = useState<Hire[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await list();
    setHires(res.hires as Hire[]);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = hires.filter((h) => h.status === "active" || h.status === "paused");
  const mrr = active.filter((h) => h.status === "active").reduce((s, h) => s + h.price_cents, 0);

  const onAction = async (h: Hire, status: "active" | "paused" | "canceled") => {
    await setStatus({ data: { hireId: h.id, status } });
    await load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-5xl md:text-6xl font-light tracking-tight">Your team.</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {active.length} agent{active.length === 1 ? "" : "s"} on roster · ${(mrr / 100).toFixed(0)}/mo
            </p>
          </div>
          <Link to="/agents" className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90">
            Hire more
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 text-muted-foreground text-sm">Loading…</div>
        ) : active.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">You haven't hired any agents yet.</p>
            <Link to="/agents" className="mt-4 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm">
              Browse agents
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-3">
            {active.map((h) => {
              const a = findAgent(h.agent_id);
              return (
                <div key={h.id} className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4 flex-wrap">
                  {a && <AgentAvatar seed={a.avatarSeed} accent={a.accent} size={56} />}
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{a?.name ?? h.agent_id}</div>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        h.status === "active" ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"
                      }`}>{h.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{a?.role}</div>
                  </div>
                  <div className="text-sm">${(h.price_cents / 100).toFixed(0)}/mo</div>
                  <div className="flex gap-2">
                    {a && (
                      <Link to="/agents/$id/configure" params={{ id: a.id }} className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-foreground/5">
                        Edit setup
                      </Link>
                    )}
                    {h.status === "active" ? (
                      <button onClick={() => onAction(h, "paused")} className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-foreground/5">
                        Pause
                      </button>
                    ) : (
                      <button onClick={() => onAction(h, "active")} className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-foreground/5">
                        Resume
                      </button>
                    )}
                    <button onClick={() => onAction(h, "canceled")} className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-foreground/5 text-destructive">
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}