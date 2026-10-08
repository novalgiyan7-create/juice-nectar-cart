import { useState } from "react";
import { Menu, MessageCircle, ShoppingBag, X } from "lucide-react";
import { WA_URL } from "@/lib/juice-data";

const LINKS = [
  ["Menu", "#menu"],
  ["About", "#about"],
  ["Order Tracking", "#tracking"],
  ["Admin", "#admin"],
];

export function Navbar({ count, onCart }: { count: number; onCart: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <a href="#" className="text-xl font-extrabold text-primary">FreshSqueeze 🥤</a>
        <nav className="hidden gap-8 md:flex">
          {LINKS.map(([l, h]) => (
            <a key={l} href={h} className="text-sm font-medium text-muted-foreground transition hover:text-primary">{l}</a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={onCart} aria-label="Open cart" className="relative rounded-full p-2 transition hover:bg-secondary">
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{count}</span>
            )}
          </button>
          <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-pop hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:inline-flex">
            <MessageCircle className="h-4 w-4" /> Chat WhatsApp
          </a>
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {LINKS.map(([l, h]) => (
            <a key={l} href={h} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 font-medium hover:bg-secondary">{l}</a>
          ))}
          <a href={WA_URL} target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 font-semibold text-primary">Chat WhatsApp</a>
        </nav>
      )}
    </header>
  );
}
