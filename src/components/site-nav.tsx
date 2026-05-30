import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, LogOut, Users } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import logoUrl from "@/assets/logo.png";

export function SiteNav() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-40 px-6 md:px-10 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center font-mono text-sm tracking-tight font-bold" aria-label="WorkerBot home">
        <img src={logoUrl} alt="WorkerBot logo" className="h-12 w-12 object-contain dark:invert" />
      </Link>

      <nav className="hidden md:flex items-center gap-1 rounded-full px-2 py-2">
        {[
          { to: "/agents", label: "Agents" },
          { to: "/support", label: "Support" },
          { to: "/about", label: "About" },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="px-4 py-1.5 text-sm rounded-full transition-colors hover:bg-foreground/10"
            activeProps={{ className: "px-4 py-1.5 text-sm rounded-full bg-foreground/10 text-foreground" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-foreground/10 transition"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {user ? (
          <>
            <Link
              to="/hired"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              <Users className="h-4 w-4" />
              My Agents
            </Link>
            <button
              onClick={async () => { await signOut(); navigate({ to: "/" }); }}
              aria-label="Sign out"
              className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-foreground/10 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium hover:bg-foreground/10 transition"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
