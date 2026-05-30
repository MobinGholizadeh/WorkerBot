import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { AgentAvatar } from "@/components/agent-avatar";
import { findAgent, type ConfigField, type ConnectProvider } from "@/lib/agents";
import { Mail, Calendar, MessageSquare, Send, Briefcase, Linkedin, LifeBuoy, Plug } from "lucide-react";

const PROVIDER_META: Record<ConnectProvider, { label: string; description: string; Icon: typeof Mail }> = {
  gmail: { label: "Gmail", description: "Read, triage and reply to your inbox.", Icon: Mail },
  google_calendar: { label: "Google Calendar", description: "Schedule and reschedule meetings.", Icon: Calendar },
  slack: { label: "Slack", description: "Post updates and escalate to teammates.", Icon: MessageSquare },
  telegram: { label: "Telegram", description: "Send messages and notifications.", Icon: Send },
  hubspot: { label: "HubSpot CRM", description: "Sync contacts and pipeline activity.", Icon: Briefcase },
  linkedin: { label: "LinkedIn", description: "Research and message prospects.", Icon: Linkedin },
  zendesk: { label: "Zendesk", description: "Read and reply to support tickets.", Icon: LifeBuoy },
};

export const Route = createFileRoute("/agents/$id")({
  loader: ({ params }) => {
    const agent = findAgent(params.id);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.agent.name} — ${loaderData?.agent.role} | WorkerBot` },
      { name: "description", content: loaderData?.agent.tagline ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      Agent not found. <Link to="/agents" className="underline ml-2">Browse all</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-10 text-destructive">{error.message}</div>,
  component: AgentDetail,
});

function AgentDetail() {
  const { agent } = Route.useLoaderData();
  const navigate = useNavigate();

  const connectFields = (agent.configFields as ConfigField[]).filter(
    (f): f is Extract<ConfigField, { kind: "connect" }> => f.kind === "connect",
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-5xl mx-auto">
        <Link to="/agents" className="text-sm text-muted-foreground hover:text-foreground">← All agents</Link>

        <div className="mt-8 grid md:grid-cols-[1fr_2fr] gap-10">
          <div>
            <AgentAvatar seed={agent.avatarSeed} accent={agent.accent} size={180} />
            <div className="mt-6 rounded-2xl bg-card border border-border p-5">
              <div className="text-4xl font-light">${agent.price}<span className="text-base text-muted-foreground"> / mo</span></div>
              <button
                onClick={() => navigate({ to: "/checkout", search: { agent: agent.id } })}
                className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition"
              >
                Hire {agent.name}
              </button>
              <Link to="/support" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">
                Need a custom version?
              </Link>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">{agent.role}</div>
            <h1 className="mt-1 text-5xl md:text-6xl font-light tracking-tight">{agent.name}.</h1>
            <p className="mt-6 text-lg text-foreground/80 leading-relaxed">{agent.tagline}</p>
            <p className="mt-4 text-foreground/70 leading-relaxed">{agent.bio}</p>

            <h2 className="mt-10 text-sm font-medium uppercase tracking-wider text-muted-foreground">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.skills.map((s: string) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm">{s}</span>
              ))}
            </div>

            {connectFields.length > 0 && (
              <>
                <h2 className="mt-10 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Required accesses
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You'll connect these after payment so {agent.name} can get to work.
                </p>
                <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                  {connectFields.map((f) => {
                    const meta = PROVIDER_META[f.provider] ?? { label: f.label, description: f.description ?? "", Icon: Plug };
                    const Icon = meta.Icon;
                    return (
                      <li key={f.key} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                        <div className="shrink-0 h-10 w-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {meta.label}
                            {f.required && <span className="text-[10px] uppercase tracking-wider text-accent">Required</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {f.description ?? meta.description}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
