import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

export type MenuItem = { id: number; name: string; category: string; price: number; tag: string; description: string };
export type Prefs = { tastes: string[]; dietary: string[]; goal: string; notes: string };
export type Recommendation = { id: number; reason: string };
export type RecommendResult = { summary: string; picks: Recommendation[] };

const schema = z.object({
  summary: z.string(),
  picks: z.array(z.object({ id: z.number(), reason: z.string() })),
});

export class GatewayError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function recommendJuices(menu: MenuItem[], prefs: Prefs): Promise<RecommendResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new GatewayError(401, "AI is not configured yet.");

  let gatewayStatus = 0;
  let gatewayMessage = "";
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const res = await fetch(input, init);
      if (!res.ok) {
        gatewayStatus = res.status;
        try { gatewayMessage = ((await res.clone().json()) as { error?: { message?: string }; message?: string })?.error?.message ?? ""; } catch { /* ignore */ }
      }
      return res;
    },
  });

  const menuText = menu
    .map((m) => `id=${m.id} | ${m.name} | ${m.category} | Rp ${m.price} | tag: ${m.tag} | ${m.description}`)
    .join("\n");

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions:
      "You are FreshSqueeze's friendly juice expert. Recommend 1 to 3 juices ONLY from the provided menu, using their exact ids. " +
      "Strictly respect dietary needs and allergies (e.g. never suggest peanut butter for nut allergy, whey for vegan or dairy-free, added sweet for low sugar). " +
      "If nothing fits, return an empty picks list and explain in summary. Keep summary under 40 words and each reason under 25 words. You may suggest customizations like 'Unsweetened' or toppings (Chia Seeds, Aloe Vera, Nata de Coco) in reasons.",
    prompt:
      `MENU:\n${menuText}\n\nCUSTOMER PREFERENCES:\nTastes: ${prefs.tastes.join(", ") || "none"}\n` +
      `Dietary needs: ${prefs.dietary.join(", ") || "none"}\nGoal: ${prefs.goal || "none"}\nNotes: ${prefs.notes || "none"}`,
    output: Output.object({ schema }),
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
        strictJsonSchema: true,
      },
    },
  });

  let parsed: z.infer<typeof schema>;
  try {
    parsed = await result.output;
  } catch (err) {
    if (gatewayStatus) throw new GatewayError(gatewayStatus, gatewayMessage);
    if (NoObjectGeneratedError.isInstance(err) && err.text) {
      try { parsed = schema.parse(JSON.parse(err.text)); } catch { throw new GatewayError(500, "Couldn't read the recommendation. Please try again."); }
    } else throw new GatewayError(500, "Something went wrong getting recommendations.");
  }

  const ids = new Set(menu.map((m) => m.id));
  return { summary: parsed.summary, picks: parsed.picks.filter((p) => ids.has(p.id)).slice(0, 3) };
}
