import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { TeamCard, type TeamMember } from "@/components/team-card";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — WorkerBot" },
      { name: "description", content: "Meet the people building WorkerBot." },
      { property: "og:title", content: "Team — WorkerBot" },
      { property: "og:description", content: "Meet the people building WorkerBot." },
    ],
    links: [{ rel: "canonical", href: "/team" }],
  }),
  component: TeamPage,
});

const TEAM: TeamMember[] = [
  {
    name: "Mobin Gholizadeh",
    role: "Co-founder & Engineer",
    bio: "Builds the agent runtime and core platform. Obsessed with reliability and clean APIs.",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Mobin",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    email: "mobin@example.com",
  },
  {
    name: "Ali Hemmatnia",
    role: "Co-founder & Designer",
    bio: "Shapes the product, brand, and the way agents feel human to work with.",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=Ali",
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    email: "ali@example.com",
  },
];

function TeamPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-6xl mx-auto">
        <header className="max-w-3xl">
          <div className="text-sm text-muted-foreground">The team</div>
          <h1 className="mt-2 text-5xl md:text-7xl font-light tracking-tight">
            The humans<br />behind the bots.
          </h1>
          <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
            A small group of engineers and designers building autonomous workers you can actually trust.
          </p>
        </header>

        <section aria-label="Team members" className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </section>
      </main>
    </div>
  );
}