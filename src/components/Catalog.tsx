import { Search, Plus } from "lucide-react";
import { CATEGORIES, rp, type Product } from "@/lib/juice-data";

export function CategoryFilter({ cat, setCat, q, setQ }: { cat: string; setCat: (c: string) => void; q: string; setQ: (s: string) => void }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${cat === c ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-foreground hover:bg-secondary"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="relative md:w-96">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your favorite juice or ingredient..."
          className="w-full rounded-full border border-input bg-card py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>
  );
}

export function ProductCard({ p, onOpen }: { p: Product; onOpen: () => void }) {
  return (
    <div onClick={onOpen} className="group cursor-pointer overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{p.tag}</span>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</p>
        <h3 className="mt-1 text-lg font-bold">{p.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-extrabold">{rp(p.price)}</span>
          <button className="btn-pop inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ items, onOpen }: { items: Product[]; onOpen: (p: Product) => void }) {
  if (!items.length) return <p className="py-16 text-center text-muted-foreground">No juices found. Try another search 🍹</p>;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} p={p} onOpen={() => onOpen(p)} />)}
    </div>
  );
}
