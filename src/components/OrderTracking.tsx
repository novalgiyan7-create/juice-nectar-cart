import { Check, Clock } from "lucide-react";
import { STATUSES, type Order } from "@/lib/juice-data";

export function OrderTracking({ order }: { order: Order }) {
  const idx = STATUSES.indexOf(order.status);
  const eta = ["25 mins", "18 mins", "12 mins", "Arrived"][idx];
  return (
    <section id="tracking" className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center text-3xl font-extrabold md:text-4xl">Live Order Tracking</h2>
        <div className="mt-10 rounded-2xl bg-card p-6 shadow-md md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Active order</p>
              <p className="text-xl font-extrabold">Order #{order.id}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground">Status: {order.status}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-4 py-1.5 text-accent"><Clock className="h-4 w-4" /> Estimated Time: {eta}</span>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-4">
            {STATUSES.map((s, i) => (
              <div key={s} className="relative flex flex-col items-center text-center">
                {i > 0 && <div className={`absolute right-1/2 top-5 h-1 w-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />}
                <div className={`relative z-10 grid h-10 w-10 place-items-center rounded-full font-bold ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${i === idx ? "ring-4 ring-primary/30 animate-pulse" : ""}`}>
                  {i < idx ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <p className={`mt-3 text-xs font-semibold sm:text-sm ${i <= idx ? "" : "text-muted-foreground"}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
