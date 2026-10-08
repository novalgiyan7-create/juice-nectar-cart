import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryFilter, ProductGrid } from "@/components/Catalog";
import { CustomizerModal } from "@/components/CustomizerModal";
import { CartDrawer, type CheckoutData } from "@/components/CartDrawer";
import { OrderTracking } from "@/components/OrderTracking";
import { AdminPanel } from "@/components/AdminPanel";
import { FAQ, Footer, FloatingWhatsApp } from "@/components/FAQFooter";
import { INITIAL_PRODUCTS, submitToWebhook, type CartItem, type Order, type Product } from "@/lib/juice-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FreshSqueeze — Fresh Cold-Pressed Juice Delivery" },
      { name: "description", content: "Order organic cold-pressed juices, detox blends and protein smoothies. Delivered fresh in 30 minutes." },
      { property: "og:title", content: "FreshSqueeze — Fresh Cold-Pressed Juice Delivery" },
      { property: "og:description", content: "Organic juices & smoothies, customized your way and delivered in 30 minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([
    { id: "FS-8821", customer: "Rina Putri", items: "2× Green Glow Detox", total: 70000, status: "On the Way" },
    { id: "FS-8820", customer: "Budi Santoso", items: "1× Power Protein Banana", total: 45000, status: "Preparing" },
  ]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [trackId, setTrackId] = useState("FS-8821");

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
    const id = `FS-${Math.floor(8822 + Math.random() * 1000)}`;
    const order: Order = {
      id, customer: d.name,
      items: cart.map((i) => `${i.qty}× ${i.product.name}`).join(", "),
      total: cart.reduce((s, i) => s + i.unitPrice * i.qty, 0),
      status: "Order Placed",
    };
    await submitToWebhook("order", { ...d, order, cart });
    setOrders((o) => [order, ...o]);
    setTrackId(id);
    setCart([]);
    setCartOpen(false);
    toast.success(`Order #${id} placed! Track it below.`);
    setTimeout(() => document.getElementById("tracking")?.scrollIntoView({ behavior: "smooth" }), 300);
  };

  const tracked = orders.find((o) => o.id === trackId) ?? orders[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar count={cart.reduce((s, i) => s + i.qty, 0)} onCart={() => setCartOpen(true)} />
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
      {tracked && <OrderTracking order={tracked} />}
      <AdminPanel products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} />
      <FAQ />
      <Footer />
      <FloatingWhatsApp />
      {selected && <CustomizerModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)}
        onQty={(k, d) => setCart((c) => c.map((x) => (x.key === k ? { ...x, qty: x.qty + d } : x)).filter((x) => x.qty > 0))}
        onRemove={(k) => setCart((c) => c.filter((x) => x.key !== k))}
        onCheckout={checkout} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
