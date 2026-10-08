import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, STATUSES, rp, type MatcherOption, type Order, type Product, type StoreSettings } from "@/lib/juice-data";
import { optionsQuery, productsQuery, settingsQuery } from "@/lib/store-queries";

const field = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm";

function useAdmin() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session]);
  return { session, isAdmin };
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/#admin" } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up" && !data.session) toast.success("Check your email to confirm your account, then sign in.");
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3">
      <p className="text-center text-sm text-muted-foreground">Store owner sign in. The first account created becomes the admin.</p>
      <input required type="email" className={field} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required type="password" minLength={6} className={field} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={busy} className="w-full rounded-full bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60">{mode === "in" ? "Sign in" : "Create account"}</button>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-primary">
        {mode === "in" ? "First time? Create the owner account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

function MenuTab() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const empty = { name: "", category: "Detox", price: 30000, tag: "", description: "", image: "" };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [show, setShow] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const row = { ...form, image: form.image || "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80" };
    const { error } = editing ? await supabase.from("products").update(row).eq("id", editing.id) : await supabase.from("products").insert(row);
    if (error) return toast.error(error.message);
    toast.success("Menu saved"); setShow(false); setEditing(null); setForm(empty); refresh();
  };
  const remove = async (p: Product) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <>
      <button onClick={() => { setEditing(null); setForm(empty); setShow(!show); }} className="btn-pop rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">+ Add New Juice</button>
      {show && (
        <form onSubmit={save} className="mt-4 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
          <input required className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}</select>
          <input required type="number" min={0} className={field} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
          <input className={field} placeholder="Tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          <input className={`${field} sm:col-span-2`} placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <textarea className={`${field} sm:col-span-2`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground sm:col-span-2">{editing ? "Save Changes" : "Add Juice"}</button>
        </form>
      )}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="p-3 font-semibold">{p.name}</td><td className="p-3">{p.category}</td><td className="p-3">{rp(p.price)}</td>
              <td className="whitespace-nowrap p-3 text-right">
                <button aria-label="Edit" onClick={() => { setEditing(p); setForm({ name: p.name, category: p.category, price: p.price, tag: p.tag, description: p.description, image: p.image }); setShow(true); }} className="rounded-full p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                <button aria-label="Delete" onClick={() => remove(p)} className="rounded-full p-2 text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>))}</tbody>
        </table>
      </div>
    </>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin_orders"],
    refetchInterval: 20000,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as Order[];
    },
  });
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin_orders"] });
  };
  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">Loading orders…</p>;
  if (!orders.length) return <p className="p-4 text-sm text-muted-foreground">No orders yet. New orders will appear here.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground"><tr><th className="p-3">Order</th><th className="p-3">Customer Name</th><th className="p-3">Items</th><th className="p-3">Total Price</th><th className="p-3">Status</th></tr></thead>
        <tbody>{orders.map((o) => (
          <tr key={o.id} className="border-t border-border align-top">
            <td className="p-3 font-mono text-xs">#{o.id}<div className="text-muted-foreground">{new Date(o.created_at).toLocaleString("id-ID")}</div></td>
            <td className="p-3"><p className="font-semibold">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.phone} · {o.payment}</p><p className="text-xs text-muted-foreground">{o.address}</p></td>
            <td className="p-3 text-muted-foreground">{o.items_summary}</td><td className="p-3 font-semibold">{rp(o.total)}</td>
            <td className="p-3"><select className={field} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
          </tr>))}</tbody>
      </table>
    </div>
  );
}

function OptionsTab() {
  const qc = useQueryClient();
  const { data: options = [] } = useQuery(optionsQuery);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const refresh = () => qc.invalidateQueries({ queryKey: ["matcher_options"] });
  const groups: { kind: MatcherOption["kind"]; title: string }[] = [
    { kind: "taste", title: "Taste preferences" }, { kind: "dietary", title: "Dietary needs" }, { kind: "goal", title: "Goals" },
  ];
  const add = async (kind: MatcherOption["kind"]) => {
    const label = (drafts[kind] ?? "").trim();
    if (!label) return;
    const sort = Math.max(0, ...options.filter((o) => o.kind === kind).map((o) => o.sort)) + 1;
    const { error } = await supabase.from("matcher_options").insert({ kind, label: label.slice(0, 40), sort });
    if (error) return toast.error(error.message);
    setDrafts({ ...drafts, [kind]: "" }); refresh();
  };
  const remove = async (id: number) => {
    const { error } = await supabase.from("matcher_options").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.kind}>
          <h4 className="mb-2 font-semibold">{g.title}</h4>
          <div className="flex flex-wrap gap-2">
            {options.filter((o) => o.kind === g.kind).map((o) => (
              <span key={o.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-background py-1 pl-3 pr-1 text-sm">
                {o.label}
                <button aria-label={`Remove ${o.label}`} onClick={() => remove(o.id)} className="rounded-full p-1 text-destructive hover:bg-secondary"><Trash2 className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); add(g.kind); }} className="mt-2 flex max-w-sm gap-2">
            <input className={field} placeholder="Add option…" maxLength={40} value={drafts[g.kind] ?? ""} onChange={(e) => setDrafts({ ...drafts, [g.kind]: e.target.value })} />
            <button aria-label="Add" className="rounded-full bg-primary px-3 text-primary-foreground"><Plus className="h-4 w-4" /></button>
          </form>
        </div>
      ))}
    </div>
  );
}

function SettingsTab() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [form, setForm] = useState<StoreSettings | null>(null);
  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);
  if (!form) return null;
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("store_settings").update({ ...form, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Store details saved"); qc.invalidateQueries({ queryKey: ["store_settings"] });
  };
  const num = (k: keyof StoreSettings, label: string) => (
    <label className="text-sm">{label}<input type="number" min={1} max={240} className={`${field} mt-1`} value={form[k] as number} onChange={(e) => setForm({ ...form, [k]: +e.target.value })} /></label>
  );
  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Store name<input required className={`${field} mt-1`} value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} /></label>
      <label className="text-sm">WhatsApp number (receives orders)<input required className={`${field} mt-1`} placeholder="e.g. 081234567890" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} /></label>
      <label className="text-sm sm:col-span-2">Store address<input className={`${field} mt-1`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
      {num("eta_placed_mins", "Est. minutes after order placed")}
      {num("eta_preparing_mins", "Est. minutes while preparing")}
      {num("eta_on_the_way_mins", "Est. minutes while on the way")}
      <button className="rounded-full bg-primary py-2.5 font-semibold text-primary-foreground sm:col-span-2">Save Store Details</button>
    </form>
  );
}

export function AdminPanel() {
  const { session, isAdmin } = useAdmin();
  const [tab, setTab] = useState<"menu" | "orders" | "options" | "settings">("orders");
  const tabs = [["orders", "Incoming Orders"], ["menu", "Menu Management"], ["options", "Juice Matcher Options"], ["settings", "Store Details"]] as const;
  return (
    <section id="admin" className="bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-extrabold md:text-4xl">Admin Panel</h2>
          {session && <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /> Sign out</button>}
        </div>
        {session && isAdmin && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map(([t, l]) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "bg-card"}`}>{l}</button>)}
          </div>
        )}
        <div className="mt-6 rounded-2xl bg-card p-4 shadow-md md:p-6">
          {!session ? <AuthForm />
            : isAdmin === null ? <p className="text-sm text-muted-foreground">Checking access…</p>
            : !isAdmin ? <p className="text-sm text-muted-foreground">This account doesn't have admin access.</p>
            : tab === "menu" ? <MenuTab /> : tab === "orders" ? <OrdersTab /> : tab === "options" ? <OptionsTab /> : <SettingsTab />}
        </div>
      </div>
    </section>
  );
}
