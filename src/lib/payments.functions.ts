import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const checkoutInput = z.object({
  hireIds: z.array(z.string().uuid()).min(1).max(20),
  cardNumber: z.string().regex(/^\d{13,19}$/, "Card number must be 13–19 digits"),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 20),
  cvc: z.string().regex(/^\d{3,4}$/),
  nameOnCard: z.string().min(1).max(120),
});

export const mockCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => checkoutInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: hires, error: hiresError } = await supabase
      .from("hires")
      .select("id, price_cents, status")
      .in("id", data.hireIds)
      .eq("user_id", userId);
    if (hiresError) throw new Error(hiresError.message);
    if (!hires || hires.length === 0) {
      throw new Error("No matching hires found.");
    }

    const amountCents = hires.reduce((s, h) => s + (h.price_cents ?? 0), 0);
    const last4 = data.cardNumber.slice(-4);
    const succeeded = last4 !== "0000";

    if (!succeeded) {
      await supabase.from("payments").insert({
        user_id: userId,
        amount_cents: amountCents,
        status: "failed",
        mock_card_last4: last4,
        failure_reason: "Card declined (mock: ends in 0000).",
        hire_ids: data.hireIds,
      });
      return { ok: false as const, reason: "Card declined. Try a different card." };
    }

    await supabase.from("payments").insert({
      user_id: userId,
      amount_cents: amountCents,
      status: "succeeded",
      mock_card_last4: last4,
      hire_ids: data.hireIds,
    });

    const { error: upError } = await supabase
      .from("hires")
      .update({ status: "active" })
      .in("id", data.hireIds)
      .eq("user_id", userId);
    if (upError) throw new Error(upError.message);

    return { ok: true as const, amountCents };
  });
