import { Github, Linkedin, Mail } from "lucide-react";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  github?: string;
  email?: string;
};

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group relative rounded-3xl bg-card border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent/50">
      <div className="flex items-center gap-4">
        <img
          src={member.avatar}
          alt={`Portrait of ${member.name}`}
          loading="lazy"
          className="h-16 w-16 rounded-2xl object-cover bg-secondary transition-transform duration-300 group-hover:scale-105"
        />
        <div className="min-w-0">
          <h3 className="text-lg font-medium truncate">{member.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{member.role}</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-foreground/75 leading-relaxed">{member.bio}</p>
      <div className="mt-5 flex items-center gap-2">
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${member.name} on LinkedIn`}
            className="h-9 w-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${member.name} on GitHub`}
            className="h-9 w-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            aria-label={`Email ${member.name}`}
            className="h-9 w-9 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}