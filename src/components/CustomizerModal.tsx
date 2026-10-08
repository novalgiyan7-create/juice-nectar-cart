import { useState } from "react";
import { X } from "lucide-react";
import { ICE, SWEET, TOPPINGS, rp, type CartItem, type Product } from "@/lib/juice-data";

export function CustomizerModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (i: CartItem) => void }) {
  const [ice, setIce] = useState(ICE[0]);
  const [sweet, setSweet] = useState(SWEET[0]);
  const [tops, setTops] = useState<string[]>([]);
  const unit = product.price + TOPPINGS.filter((t) => tops.includes(t.name)).reduce((s, t) => s + t.price, 0);

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card sm:rounded-2xl animate-in fade-in zoom-in-95">
        <div className="relative">
          <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-card p-2 shadow"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-extrabold">Customize Your Drink</h2>
            <p className="text-muted-foreground">{product.name} · {rp(product.price)}</p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Ice Level</h4>
            <div className="flex flex-wrap gap-2">{ICE.map((o) => <button key={o} className={pill(ice === o)} onClick={() => setIce(o)}>{o}</button>)}</div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Sweetness Level</h4>
            <div className="flex flex-wrap gap-2">{SWEET.map((o) => <button key={o} className={pill(sweet === o)} onClick={() => setSweet(o)}>{o}</button>)}</div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Toppings</h4>
            <div className="space-y-2">
              {TOPPINGS.map((t) => (
                <label key={t.name} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 hover:bg-secondary">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={tops.includes(t.name)}
                    onChange={() => setTops(tops.includes(t.name) ? tops.filter((x) => x !== t.name) : [...tops, t.name])} />
                  {t.name} (+{rp(t.price)})
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => onAdd({ key: `${product.id}-${ice}-${sweet}-${[...tops].sort().join(",")}`, product, ice, sweet, toppings: tops, unitPrice: unit, qty: 1 })}
            className="btn-pop w-full rounded-full bg-primary py-3.5 font-bold text-primary-foreground">
            Add Custom Drink to Cart · {rp(unit)}
          </button>
        </div>
      </div>
    </div>
  );
}
