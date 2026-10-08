import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CATEGORIES, STATUSES, rp, submitToWebhook, type Order, type Product } from "@/lib/juice-data";

const empty = { name: "", category: "Detox", price: 30000, tag: "", description: "", image: "" };

export function AdminPanel({ products, setProducts, orders, setOrders }: {
  products: Product[]; setProducts: (p: Product[]) => void; orders: Order[]; setOrders: (o: Order[]) => void;
}) {
  const [tab, setTab] = useState<"menu" | "orders">("menu");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm";

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const img = form.image || "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80";
    if (editing) setProducts(products.map((p) => (p.id === editing.id ? { ...editing, ...form, image: img } : p)));
    else setProducts([...products, { id: Date.now(), ...form, image: img }]);
    submitToWebhook("product", form);
    setShowForm(false); setEditing(null); setForm(empty);
  };

  const tabBtn = (t: typeof tab, l: string) => (
    <button onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "bg-card"}`}>{l}</button>
  );

  return (
    <section id="admin" className="bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-extrabold md:text-4xl">Admin Panel</h2>
        <div className="mt-6 flex gap-2">{tabBtn("menu", "Menu Management")}{tabBtn("orders", "Incoming Orders")}</div>
        <div className="mt-6 rounded-2xl bg-card p-4 shadow-md md:p-6">
          {tab === "menu" ? (
            <>
              <button onClick={() => { setEditing(null); setForm(empty); setShowForm(!showForm); }} className="btn-pop rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">+ Add New Juice</button>
              {showForm && (
                <form onSubmit={save} className="mt-4 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <input required className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <select className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input required type="number" className={field} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
                  <input className={field} placeholder="Tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                  <input className={`${field} sm:col-span-2`} placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <textarea className={`${field} sm:col-span-2`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <button className="rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground sm:col-span-2">{editing ? "Save Changes" : "Add Juice"}</button>
                </form>
              )}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3 font-semibold">{p.name}</td><td className="p-3">{p.category}</td><td className="p-3">{rp(p.price)}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button aria-label="Edit" onClick={() => { setEditing(p); setForm({ name: p.name, category: p.category, price: p.price, tag: p.tag, description: p.description, image: p.image }); setShowForm(true); }} className="rounded-full p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                          <button aria-label="Delete" onClick={() => setProducts(products.filter((x) => x.id !== p.id))} className="rounded-full p-2 text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground"><tr><th className="p-3">Order</th><th className="p-3">Customer Name</th><th className="p-3">Items</th><th className="p-3">Total Price</th><th className="p-3">Status</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="p-3 font-mono text-xs">#{o.id}</td><td className="p-3 font-semibold">{o.customer}</td>
                      <td className="p-3 text-muted-foreground">{o.items}</td><td className="p-3 font-semibold">{rp(o.total)}</td>
                      <td className="p-3">
                        <select className={field} value={o.status} onChange={(e) => setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: e.target.value } : x)))}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
