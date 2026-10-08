import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getRecommendations } from "@/lib/recommend.functions";
import { rp, type Product } from "@/lib/juice-data";

const TASTES = ["Sweet", "Sour / Tangy", "Fruity", "Green / Earthy", "Creamy", "Refreshing"];
const DIETARY = ["Vegan", "Dairy-Free", "Nut Allergy", "Low Sugar", "Gluten-Free", "High Protein"];
const GOALS = ["Detox", "Energy Boost", "Post-Workout", "Immunity", "Just Delicious"];

export function JuiceMatcher({ products, onOpen }: { products: Product[]; onOpen: (p: Product) => void }) {
  const [tastes, setTastes] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ summary: string; picks: { id: number; reason: string }[] } | null>(null);
  const recommend = useServerFn(getRecommendations);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`;

  const submit = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await recommend({
        data: {
          menu: products.map(({ id, name, category, price, tag, description }) => ({ id, name, category, price, tag, description })),
          prefs: { tastes, dietary, goal, notes },
        },
      });
      if (r.ok) setResult(r); else setError(r.error);
    } catch {
      setError("Couldn't reach our juice expert. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <section id="match" className="hero-bg py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground"><Sparkles className="h-4 w-4" /> AI Juice Matcher</span>
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Find Your Perfect Juice</h2>
          <p className="mt-2 text-muted-foreground">Tell us what you love and what you avoid — we'll pick from our menu for you.</p>
        </div>
        <div className="mt-10 space-y-6 rounded-2xl bg-card p-6 shadow-md md:p-8">
          <div><h4 className="mb-2 font-semibold">Taste preferences</h4>
            <div className="flex flex-wrap gap-2">{TASTES.map((t) => <button key={t} className={chip(tastes.includes(t))} onClick={() => toggle(tastes, setTastes, t)}>{t}</button>)}</div></div>
          <div><h4 className="mb-2 font-semibold">Dietary needs</h4>
            <div className="flex flex-wrap gap-2">{DIETARY.map((t) => <button key={t} className={chip(dietary.includes(t))} onClick={() => toggle(dietary, setDietary, t)}>{t}</button>)}</div></div>
          <div><h4 className="mb-2 font-semibold">Your goal</h4>
            <div className="flex flex-wrap gap-2">{GOALS.map((t) => <button key={t} className={chip(goal === t)} onClick={() => setGoal(goal === t ? "" : t)}>{t}</button>)}</div></div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 300))} rows={2}
            placeholder="Anything else? e.g. allergic to strawberries, love mango..."
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={submit} disabled={loading}
            className="btn-pop inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-bold text-primary-foreground disabled:opacity-60">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Finding your match...</> : <><Sparkles className="h-5 w-5" /> Recommend My Juice</>}
          </button>
          {error && <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
          {result && (
            <div className="space-y-4">
              <p className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">{result.summary}</p>
              {result.picks.map((pick) => {
                const p = products.find((x) => x.id === pick.id);
                if (!p) return null;
                return (
                  <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center">
                    <img src={p.image} alt={p.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{p.name} <span className="text-sm font-semibold text-primary">· {rp(p.price)}</span></p>
                      <p className="text-sm text-muted-foreground">{pick.reason}</p>
                    </div>
                    <button onClick={() => onOpen(p)} className="btn-pop shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground">Customize & Add</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
