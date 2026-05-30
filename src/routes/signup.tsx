import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";

type Search = { redirect?: string };

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Create account — WorkerBot" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirectTo ?? "/hired", replace: true });
  }, [user, redirectTo, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + (redirectTo ?? "/hired"),
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg("Check your email to confirm your account.");
  };

  const onGoogle = async () => {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (redirectTo ?? "/hired"),
    });
    if (result.error) setErr(String(result.error));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 pt-36 pb-24 max-w-md mx-auto">
        <h1 className="text-4xl font-light tracking-tight">Create your account.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hire your first agent in minutes.</p>

        <button
          onClick={onGoogle}
          className="mt-8 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-foreground/5"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
          {msg && <div className="text-sm text-foreground/80">{msg}</div>}
          <button disabled={loading}
            className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" search={{ redirect: redirectTo }} className="text-foreground underline">Sign in</Link>
        </p>
      </main>
    </div>
  );
}