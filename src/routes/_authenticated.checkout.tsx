import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { AgentAvatar } from "@/components/agent-avatar";
import { upsertDraftHire } from "@/lib/hires.functions";
import { mockCheckout } from "@/lib/payments.functions";
import { findAgent } from "@/lib/agents";
import { Loader2 } from "lucide-react";

type Search = { agent?: string };

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    agent: typeof s.agent === "string" ? s.agent : undefined,
  }),
  head: () => ({ meta: [{ title: "Checkout — WorkerBot" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { agent: agentId } = Route.useSearch();
  const navigate = useNavigate();
  const upsert = useServerFn(upsertDraftHire);
  const pay = useServerFn(mockCheckout);

  const agent = agentId ? findAgent(agentId) : undefined;
  const [hireId, setHireId] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState<"idle" | "validating" | "charging">("idle");
  const [err, setErr] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState(String(new Date().getFullYear() + 2));
  const [cvc, setCvc] = useState("123");
  const [nameOnCard, setNameOnCard] = useState("");

  useEffect(() => {
    if (!agent) { setCreating(false); return; }
    (async () => {
      try {
        const res = await upsert({
          data: {
            agentId: agent.id,
            brief: "",
            fields: {},
            priceCents: agent.price * 100,
          },
        });
        setHireId(res.hireId);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not load.");
      } finally {
        setCreating(false);
      }
    })();
  }, [agent, upsert]);

  const total = agent ? agent.price * 100 : 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!agent || !hireId) return;
    setSubmitting(true);
    setProcessingStep("validating");
    try {
      // Simulate validating step
      await new Promise((r) => setTimeout(r, 700));
      setProcessingStep("charging");
      const res = await pay({
        data: {
          hireIds: [hireId],
          cardNumber: cardNumber.replace(/\s/g, ""),
          expMonth: parseInt(expMonth, 10),
          expYear: parseInt(expYear, 10),
          cvc,
          nameOnCard,
        },
      });
      if (res.ok) navigate({ to: "/checkout-success", search: { agent: agent.id } });
      else navigate({ to: "/checkout-failed", search: { reason: res.reason, agent: agent.id } });
    } catch (e) {
      navigate({ to: "/checkout-failed", search: { reason: e instanceof Error ? e.message : "Payment error", agent: agent.id } });
    } finally {
      setSubmitting(false);
      setProcessingStep("idle");
    }
  };

  const simulateDecline = () => setCardNumber("4242424242420000");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-4xl mx-auto">
        <h1 className="text-5xl font-light tracking-tight">Checkout.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Demo mode — any card works <span className="text-foreground">except numbers ending in 0000</span> (always fail).
        </p>

        {creating ? (
          <div className="mt-12 flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing your order…
          </div>
        ) : !agent ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No agent selected. <Link to="/agents" className="underline">Browse agents</Link>.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 grid md:grid-cols-[1fr_1.2fr] gap-6">
            <section className="rounded-3xl bg-card border border-border p-6">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Order</h2>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <AgentAvatar seed={agent.avatarSeed} accent={agent.accent} size={40} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.role}</div>
                  </div>
                  <div className="text-sm">${agent.price}/mo</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between">
                <span className="text-sm text-muted-foreground">Total / month</span>
                <span className="text-2xl font-light">${(total / 100).toFixed(0)}</span>
              </div>
              <button
                type="button"
                onClick={simulateDecline}
                className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Simulate a declined card
              </button>
            </section>

            <section className="rounded-3xl bg-card border border-border p-6 space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Card</h2>
              <div>
                <label className="text-sm font-medium">Name on card</label>
                <input required value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
              </div>
              <div>
                <label className="text-sm font-medium">Card number</label>
                <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground/40" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Mo</label>
                  <input required value={expMonth} onChange={(e) => setExpMonth(e.target.value)}
                    className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">Yr</label>
                  <input required value={expYear} onChange={(e) => setExpYear(e.target.value)}
                    className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">CVC</label>
                  <input required value={cvc} onChange={(e) => setCvc(e.target.value)}
                    className="mt-1.5 w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground/40" />
                </div>
              </div>
              {err && <div className="text-sm text-destructive">{err}</div>}
              <button disabled={submitting}
                className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40 inline-flex items-center justify-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting
                  ? processingStep === "validating"
                    ? "Validating card…"
                    : "Charging…"
                  : `Pay $${(total / 100).toFixed(0)}/mo`}
              </button>
            </section>
          </form>
        )}
      </main>
    </div>
  );
}