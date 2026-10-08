import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Toaster, toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryFilter, ProductGrid } from "@/components/Catalog";
import { CustomizerModal } from "@/components/CustomizerModal";
import { CartDrawer, type CheckoutData } from "@/components/CartDrawer";
import { OrderTracking } from "@/components/OrderTracking";
import { JuiceMatcher } from "@/components/JuiceMatcher";
import { AdminPanel } from "@/components/AdminPanel";
import { FAQ, Footer, FloatingWhatsApp } from "@/components/FAQFooter";
import { DEFAULT_SETTINGS, waLink, type CartItem, type Product } from "@/lib/juice-data";
import { optionsQuery, productsQuery, settingsQuery } from "@/lib/store-queries";
import { placeOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Giant Juice — Fresh Cold-Pressed Juice Delivery" },
      { name: "description", content: "Order organic cold-pressed juices, detox blends and protein smoothies from Giant Juice, delivered fresh." },
      { property: "og:title", content: "Giant Juice — Fresh Cold-Pressed Juice Delivery" },
      { property: "og:description", content: "Organic juices & smoothies, customized your way and delivered fresh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ORDER_KEY = "gj_last_order";

function Index() {
  const { data: products = [] } = useQuery(productsQuery);
  const { data: options = [] } = useQuery(optionsQuery);
  const { data: settings = DEFAULT_SETTINGS } = useQuery(settingsQuery);
  const submitOrder = useServerFn(placeOrder);

  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [trackId, setTrackId] = useState<string | null>(null);

  useEffect(() => { setTrackId(localStorage.getItem(ORDER_KEY)); }, []);

  const waUrl = waLink(settings.whatsapp_number, settings.store_name);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return products.filter((p) => (cat === "All" || p.category === cat) &&
      (p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)));
  }, [products, cat, q]);

  const addToCart = (item: CartItem) => {
    setCart((c) => {
      const ex = c.find((x) => x.key === item.key);
      return ex ? c.map((x) => (x.key === item.key ? { ...x, qty: x.qty + 1 } : x)) : [...c, item];
    });
    setSelected(null);
    toast.success(`${item.product.name} added to cart`);
  };

  const checkout = async (d: CheckoutData) => {
    try {
      const r = await submitOrder({
        data: {
          ...d,
          items: cart.map((i) => ({ productId: i.product.id, qty: i.qty, ice: i.ice, sweet: i.sweet, toppings: i.toppings })),
        },
      });
      if (!r.ok) return toast.error(r.error);
      localStorage.setItem(ORDER_KEY, r.id);
      setTrackId(r.id);
      setCart([]);
      setCartOpen(false);
      toast.success(`Order #${r.id} placed! Track it below.`);
      setTimeout(() => document.getElementById("tracking")?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch {
      toast.error("Please check your details and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar count={cart.reduce((s, i) => s + i.qty, 0)} onCart={() => setCartOpen(true)} storeName={settings.store_name} waUrl={waUrl} />
      <Hero />
      <section id="menu" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">Our Fresh Menu</h2>
            <p className="mt-2 text-muted-foreground">Tap any drink to customize it your way.</p>
          </div>
          <CategoryFilter cat={cat} setCat={setCat} q={q} setQ={setQ} />
          <ProductGrid items={filtered} onOpen={setSelected} />
        </div>
      </section>
      <JuiceMatcher products={products} options={options} onOpen={setSelected} />
      <OrderTracking orderId={trackId} settings={settings} />
      <AdminPanel />
      <FAQ />
      <Footer storeName={settings.store_name} address={settings.address} waUrl={waUrl} />
      <FloatingWhatsApp waUrl={waUrl} />
      {selected && <CustomizerModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)}
        onQty={(k, d) => setCart((c) => c.map((x) => (x.key === k ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0))}
        onRemove={(k) => setCart((c) => c.filter((x) => x.key !== k))}
        onCheckout={checkout} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
