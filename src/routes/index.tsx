import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SplineHero } from "@/components/spline-hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkerBot — Hire autonomous AI agents" },
      { name: "description", content: "A marketplace of autonomous AI workers. Hire agents that schedule, sell, support, and ship — by the month." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="hero-dim relative min-h-screen overflow-hidden bg-background text-foreground">
      <SiteNav />

      {/* Full-screen Spline scene */}
      <div className="absolute inset-0 z-0">
        <SplineHero />
      </div>

      <main className="relative z-10 px-6 md:px-10 pt-32 md:pt-40 pb-12 max-w-7xl mx-auto pointer-events-none">
        <div className="max-w-[58%] md:max-w-[52%] lg:max-w-[46%]">
          <h1 className="font-serif text-[11vw] md:text-[6.2vw] lg:text-[5.4vw] leading-[1] font-normal tracking-tight text-foreground/90">
            Autonomous<br />Workers, hired<br />by the month.
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3 pointer-events-auto">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Browse Agents <span aria-hidden>›</span>
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full bg-foreground/10 backdrop-blur-md border border-border/50 px-5 py-3 text-sm font-medium hover:bg-foreground/20 transition"
          >
            How it Works
          </Link>
        </div>
        </div>
      </main>
    </div>
  );
}
