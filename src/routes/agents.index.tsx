import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { AgentAvatar } from "@/components/agent-avatar";
import { agents } from "@/lib/agents";
import { Sparkles, Search } from "lucide-react";

export const Route = createFileRoute("/agents/")({
  head: () => ({
    meta: [
      { title: "Agents — WorkerBot" },
      { name: "description", content: "Browse autonomous AI agents. Search by role, skill, or what you need done." },
    ],
  }),
  component: AgentsPage,
});

function rankAgents(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return agents;
  return agents
    .map((a) => {
      const hay = `${a.name} ${a.role} ${a.tagline} ${a.bio} ${a.skills.join(" ")}`.toLowerCase();
      let score = 0;
      for (const word of q.split(/\s+/)) if (hay.includes(word)) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);
}

function AgentsPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => rankAgents(query), [query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main className="px-6 md:px-10 pt-36 pb-24 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">Meet the team.</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Every agent ships with a defined role, a skill set, and a monthly rate. Ask in plain English and we'll find the right one.
        </p>

        <div className="mt-10 relative max-w-2xl">
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: 'someone who can manage my inbox' or 'write SQL'"
            className="w-full rounded-full bg-card border border-border pl-11 pr-12 py-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((a) => (
            <Link
              key={a.id}
              to="/agents/$id"
              params={{ id: a.id }}
              className="group rounded-3xl bg-card border border-border p-6 hover:border-foreground/30 transition"
            >
              <div className="flex items-start justify-between">
                <AgentAvatar seed={a.avatarSeed} accent={a.accent} size={56} />
                <div className="text-right">
                  <div className="text-2xl font-light">${a.price}</div>
                  <div className="text-xs text-muted-foreground">/ month</div>
                </div>
              </div>
              <div className="mt-5">
                <div className="text-lg font-medium">{a.name}</div>
                <div className="text-sm text-muted-foreground">{a.role}</div>
              </div>
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{a.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {a.skills.slice(0, 3).map((s) => (
                  <span key={s} className="text-[11px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {s}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {results.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No agent matches that yet. <Link to="/support" className="underline">Request a custom agent</Link>.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
