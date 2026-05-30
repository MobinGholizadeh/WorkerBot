export function AgentAvatar({ seed, accent, size = 64 }: { seed: string; accent: string; size?: number }) {
  const initial = seed[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gradient-to-br ${accent} flex items-center justify-center font-semibold text-foreground/80`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6),transparent_60%)]" />
      <span className="relative">{initial}</span>
    </div>
  );
}
