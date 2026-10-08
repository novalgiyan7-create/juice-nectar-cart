import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  menu: z.array(z.object({
    id: z.number(), name: z.string().max(100), category: z.string().max(50), price: z.number(),
    tag: z.string().max(50), description: z.string().max(400),
  })).min(1).max(50),
  prefs: z.object({
    tastes: z.array(z.string().max(40)).max(10),
    dietary: z.array(z.string().max(40)).max(10),
    goal: z.string().max(60),
    notes: z.string().max(300),
  }),
});

export type RecommendResponse =
  | { ok: true; summary: string; picks: { id: number; reason: string }[] }
  | { ok: false; error: string };

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((d) => input.parse(d))
  .handler(async ({ data }): Promise<RecommendResponse> => {
    const { recommendJuices, GatewayError } = await import("./recommend.server");
    try {
      const r = await recommendJuices(data.menu, data.prefs);
      return { ok: true, ...r };
    } catch (e) {
      if (e instanceof GatewayError) {
        const msg =
          e.status === 429 ? "Our juice expert is busy right now. Please try again in a moment."
          : e.status === 402 ? "AI recommendations are temporarily unavailable (credits used up)."
          : e.message || "Something went wrong getting recommendations.";
        return { ok: false, error: msg };
      }
      return { ok: false, error: "Something went wrong getting recommendations." };
    }
  });
