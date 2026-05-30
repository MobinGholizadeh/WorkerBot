import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AgentConfig = {
  fields: Record<string, string>;
  instructions: string;
};

type CartCtx = {
  items: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  configs: Record<string, AgentConfig>;
  setConfig: (id: string, config: AgentConfig) => void;
};

const Ctx = createContext<CartCtx>({
  items: {},
  add: () => {},
  remove: () => {},
  clear: () => {},
  count: 0,
  configs: {},
  setConfig: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [configs, setConfigs] = useState<Record<string, AgentConfig>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
      const rawCfg = localStorage.getItem("cart-configs");
      if (rawCfg) setConfigs(JSON.parse(rawCfg));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("cart-configs", JSON.stringify(configs));
  }, [configs]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      add: (id) => setItems((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 })),
      remove: (id) =>
        setItems((p) => {
          const n = { ...p };
          delete n[id];
          return n;
        }),
      clear: () => {
        setItems({});
        setConfigs({});
      },
      count: Object.values(items).reduce((a, b) => a + b, 0),
      configs,
      setConfig: (id, config) => setConfigs((p) => ({ ...p, [id]: config })),
    }),
    [items, configs],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
