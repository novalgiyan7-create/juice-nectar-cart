import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PAYMENTS, ICE, SWEET, TOPPINGS, normalizePhone, rp, unitPrice } from "./juice-data";

const orderInput = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(8).max(20),
  address: z.string().trim().min(5).max(300),
  payment: z.enum(PAYMENTS as [string, ...string[]]),
  items: z.array(z.object({
    productId: z.number().int(),
    qty: z.number().int().min(1).max(20),
    ice: z.enum(ICE as [string, ...string[]]),
    sweet: z.enum(SWEET as [string, ...string[]]),
    toppings: z.array(z.enum(TOPPINGS.map((t) => t.name) as [string, ...string[]])).max(3),
  })).min(1).max(30),
});

export type PlaceOrderResult = { ok: true; id: string; notified: boolean } | { ok: false; error: string };

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => orderInput.parse(d))
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error: pErr } = await supabaseAdmin.from("products").select("id,name,price").in("id", ids);
    if (pErr || !products) return { ok: false, error: "Couldn't load the menu. Please try again." };
    const byId = new Map(products.map((p) => [p.id, p]));
    if (ids.some((id) => !byId.has(id))) return { ok: false, error: "A drink in your cart is no longer available." };

    const lines = data.items.map((i) => {
      const p = byId.get(i.productId)!;
      const unit = unitPrice(p.price, i.toppings);
      return { name: p.name, qty: i.qty, ice: i.ice, sweet: i.sweet, toppings: i.toppings, unit, subtotal: unit * i.qty };
    });
    const total = lines.reduce((s, l) => s + l.subtotal, 0);
    const summary = lines.map((l) => `${l.qty}× ${l.name}`).join(", ");
    const id = `GJ-${Math.floor(10000 + Math.random() * 90000)}`;

    const { error } = await supabaseAdmin.from("orders").insert({
      id, customer_name: data.name, phone: normalizePhone(data.phone), address: data.address,
      payment: data.payment, items: lines, items_summary: summary, total,
    });
    if (error) {
      console.error("order insert failed", error);
      return { ok: false, error: "Couldn't place your order. Please try again." };
    }

    // Notify the store owner on WhatsApp via Fonnte
    let notified = false;
    const token = process.env["FONNTE_TOKEN"];
    const { data: settings } = await supabaseAdmin.from("store_settings").select("store_name,whatsapp_number").eq("id", 1).single();
    const target = normalizePhone(settings?.whatsapp_number ?? "");
    if (token && target) {
      const message =
        `🧃 *New order #${id}* — ${settings?.store_name ?? ""}\n\n` +
        lines.map((l) => `• ${l.qty}× ${l.name} (${l.ice}, ${l.sweet}${l.toppings.length ? ", " + l.toppings.join(", ") : ""}) — ${rp(l.subtotal)}`).join("\n") +
        `\n\n*Total:* ${rp(total)}\n*Payment:* ${data.payment}\n\n*Customer:* ${data.name}\n*WhatsApp:* ${normalizePhone(data.phone)}\n*Address:* ${data.address}`;
      try {
        const res = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { Authorization: token },
          body: new URLSearchParams({ target, message, countryCode: "62" }),
        });
        const body = (await res.json().catch(() => ({}))) as { status?: boolean; reason?: string };
        notified = res.ok && body.status === true;
        if (!notified) console.error("Fonnte send failed", res.status, body.reason);
      } catch (e) {
        console.error("Fonnte request error", e);
      }
    }
    return { ok: true, id, notified };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().regex(/^GJ-\d{5}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("orders").select("id,status").eq("id", data.id).maybeSingle();
    return row ?? null;
  });
