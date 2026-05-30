import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — WorkerBot" },
      { name: "description", content: "Ask for a custom agent configuration. We'll scope it with you." },
    ],
  }),
  component: Support,
});

type Msg = { role: "user" | "agent"; text: string };

const seed: Msg[] = [
  { role: "agent", text: "Hi — I'm Iris, your creator concierge. Tell me what you wish you could automate." },
];

function reply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("price") || q.includes("cost")) return "Custom agents start at $199/mo. Final quote depends on integrations and SLA.";
  if (q.includes("email") || q.includes("inbox") || q.includes("calendar")) return "Sounds like Ada (our secretary agent) covers 80% of that. Want a custom variant trained on your inbox?";
  if (q.includes("sales") || q.includes("lead")) return "Milo handles outbound — we can fork him with your ICP and CRM. Send a sample target list and we'll spec it.";
  if (q.includes("data") || q.includes("sql") || q.includes("dashboard")) return "Nova can connect to your warehouse. Which one — Snowflake, BigQuery, Postgres?";
  if (q.length < 8) return "Tell me a bit more — what role would this agent play on your team?";
  return "Got it. I'll loop in the creators and we'll draft a scoped proposal within 24 hours. What's the best email to reach you?";
}

function Support() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "agent", text: reply(text) }]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="px-6 md:px-10 pt-36 pb-24 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light tracking-tight">Custom configurations.</h1>
        <p className="mt-4 text-muted-foreground">Chat with a creator. We build agents to fit your stack.</p>

        <div className="mt-10 rounded-3xl bg-card border border-border overflow-hidden flex flex-col h-[60vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Describe what you need..."
              className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
            />
            <button onClick={send} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
