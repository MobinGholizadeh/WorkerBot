import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { XCircle, ArrowLeft } from "lucide-react";

type Search = { reason?: string; agent?: string };

export const Route = createFileRoute("/_authenticated/checkout-failed")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    reason: typeof s.reason === "string" ? s.reason : undefined,
    agent: typeof s.agent === "string" ? s.agent : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment failed — WorkerBot" }] }),
  component: FailedPage,
});

function FailedPage() {
  const { reason, agent } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 pt-36 pb-24 max-w-md mx-auto text-center">
        <XCircle className="h-14 w-14 mx-auto text-destructive" />
        <h1 className="mt-6 text-4xl font-light tracking-tight">Payment failed.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {reason ?? "We couldn't process your payment. Please try again or use a different card."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {agent && (
            <Link
              to="/checkout"
              search={{ agent }}
              className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90"
            >
              Try again
            </Link>
          )}
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-foreground/5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to agents
          </Link>
        </div>
      </main>
    </div>
  );
}