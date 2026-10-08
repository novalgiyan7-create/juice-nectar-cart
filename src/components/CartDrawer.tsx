import { useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { PAYMENTS, rp, type CartItem } from "@/lib/juice-data";

export type CheckoutData = { name: string; phone: string; address: string; payment: string };

export function CartDrawer({ open, items, onClose, onQty, onRemove, onCheckout }: {
  open: boolean; items: CartItem[]; onClose: () => void;
  onQty: (key: string, d: number) => void; onRemove: (key: string) => void;
  onCheckout: (d: CheckoutData) => void;
}) {
  const [form, setForm] = useState<CheckoutData>({ name: "", phone: "", address: "", payment: PAYMENTS[0] });
  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const field = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-foreground/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-xl font-extrabold">Your Fresh Cart 🛒</h2>
          <button onClick={onClose} aria-label="Close cart" className="rounded-full p-2 hover:bg-secondary"><X /></button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground">Your cart is empty. Let's add some freshness!</div>
        ) : (
          <form className="flex-1 space-y-5 overflow-y-auto p-5" onSubmit={(e) => { e.preventDefault(); onCheckout(form); }}>
            {items.map((i) => (
              <div key={i.key} className="flex gap-3">
                <img src={i.product.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{i.product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{i.ice} · {i.sweet}{i.toppings.length ? ` · ${i.toppings.join(", ")}` : ""}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" onClick={() => onQty(i.key, -1)} className="rounded-full border border-border p-1"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                    <button type="button" onClick={() => onQty(i.key, 1)} className="rounded-full border border-border p-1"><Plus className="h-3 w-3" /></button>
                    <button type="button" onClick={() => onRemove(i.key)} className="ml-auto text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold">{rp(i.unitPrice * i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Total</span><span>{rp(total)}</span></div>
            <div className="space-y-3">
              <input required className={field} placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="tel" className={field} placeholder="WhatsApp Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea required rows={2} className={field} placeholder="Delivery Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <p className="text-sm font-semibold">Payment Method</p>
              {PAYMENTS.map((p) => (
                <label key={p} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${form.payment === p ? "border-primary bg-secondary" : "border-border"}`}>
                  <input type="radio" name="pay" checked={form.payment === p} onChange={() => setForm({ ...form, payment: p })} /> {p}
                </label>
              ))}
            </div>
            <button type="submit" className="btn-pop w-full rounded-full bg-primary py-3.5 font-bold text-primary-foreground">Place Order Now</button>
          </form>
        )}
      </aside>
    </div>
  );
}
