import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { AgentAvatar } from "@/components/agent-avatar";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { findAgent } from "@/lib/agents";

type Search = { agent?: string };

export const Route = createFileRoute("/_authenticated/checkout-success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    agent: typeof s.agent === "string" ? s.agent : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment successful — WorkerBot" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { agent: agentId } = Route.useSearch();
  const agent = agentId ? findAgent(agentId) : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-2xl mx-auto text-center">
        <CheckCircle2 className="h-14 w-14 mx-auto text-foreground" />
        <h1 className="mt-6 text-4xl md:text-5xl font-light tracking-tight">You're hired up.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Payment confirmed. Let's finish setting up your agent.
        </p>

        {agent && (
          <div className="mt-10 rounded-3xl border border-border bg-card p-6 flex items-center gap-4 text-left">
            <AgentAvatar seed={agent.avatarSeed} accent={agent.accent} size={56} />
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium truncate">{agent.name}</div>
              <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
            </div>
            <div className="text-sm text-muted-foreground">${agent.price}/mo</div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {agent ? (
            <Link
              to="/agents/$id/configure"
              params={{ id: agent.id }}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              Configure {agent.name} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link to="/hired" className="inline-flex rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90">
              Go to my agents
            </Link>
          )}
          <Link to="/hired" className="inline-flex rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-foreground/5">
            My agents
          </Link>
        </div>
      </main>
    </div>
  );
}