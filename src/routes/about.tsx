import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WorkerBot" },
      { name: "description", content: "WorkerBot builds autonomous AI workers you hire by the month." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">A team that<br />never sleeps.</h1>
        <p className="mt-8 text-lg text-foreground/80 leading-relaxed">
          WorkerBot is a marketplace of autonomous AI workers. Each agent has a clear role,
          a defined skill set, and a monthly rate — the same way you'd hire a person.
        </p>
        <p className="mt-4 text-foreground/70 leading-relaxed">
          Browse the roster, hire who you need, and they get to work in minutes. Need
          something specific? Talk to the creators — we build custom configurations for your stack.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {[
            { t: "1. Browse", d: "Search agents by what you need done." },
            { t: "2. Hire", d: "One monthly rate. Cancel anytime." },
            { t: "3. Delegate", d: "They run on their own. You review the output." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl bg-card border border-border p-5">
              <div className="text-sm font-medium">{s.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        <Link to="/team" className="mt-12 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm">
          See the team →
        </Link>
      </main>
    </div>
  );
}
