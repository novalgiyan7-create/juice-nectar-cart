import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { WA_URL } from "@/lib/juice-data";

const FAQS = [
  ["Are your juices 100% fresh?", "Yes! Every bottle is cold-pressed daily upon order with zero preservatives or artificial sweeteners."],
  ["How long can I store the juices?", "We recommend consuming within 24 hours and keeping refrigerated at all times."],
  ["How does delivery work?", "We deliver fresh via our courier partners within 30-45 minutes in sealed thermal bags."],
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-extrabold md:text-4xl">Frequently Asked Questions</h2>
        <div className="mt-10 space-y-3">
          {FAQS.map(([q, a], i) => (
            <div key={q} className="rounded-2xl bg-card shadow-md">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold">
                {q}<ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? "rotate-180 text-primary" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-muted-foreground">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-foreground py-12 text-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-extrabold">FreshSqueeze 🥤</p>
          <p className="mt-1 text-sm opacity-70">Bringing nature's best to your doorstep.</p>
        </div>
        <div className="flex gap-6 text-sm opacity-80">
          <a href="#" className="hover:opacity-100">Privacy Policy</a>
          <a href="#" className="hover:opacity-100">Terms of Service</a>
          <a href={WA_URL} target="_blank" rel="noreferrer" className="hover:opacity-100">Contact Us</a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs opacity-60">© 2026 FreshSqueeze. All rights reserved.</p>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a href={WA_URL} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp"
      className="btn-pop fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl">
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
