export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  tag: string;
  description: string;
  image: string;
};

export type CartItem = {
  key: string;
  product: Product;
  ice: string;
  sweet: string;
  toppings: string[];
  unitPrice: number;
  qty: number;
};

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  payment: string;
  items_summary: string;
  total: number;
  status: string;
  created_at: string;
};

export type StoreSettings = {
  store_name: string;
  whatsapp_number: string;
  address: string;
  eta_placed_mins: number;
  eta_preparing_mins: number;
  eta_on_the_way_mins: number;
};

export type MatcherOption = { id: number; kind: "taste" | "dietary" | "goal"; label: string; sort: number };

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: "Giant Juice",
  whatsapp_number: "",
  address: "",
  eta_placed_mins: 30,
  eta_preparing_mins: 20,
  eta_on_the_way_mins: 12,
};

export const CATEGORIES = ["All", "Detox", "Tropical", "Protein Booster", "Smoothie"];
export const STATUSES = ["Order Placed", "Preparing", "On the Way", "Delivered"];
export const ICE = ["Normal Ice", "Less Ice", "No Ice"];
export const SWEET = ["Normal Sweet (100%)", "Less Sweet (50%)", "Unsweetened (0%)"];
export const TOPPINGS = [
  { name: "Chia Seeds", price: 5000 },
  { name: "Aloe Vera", price: 4000 },
  { name: "Nata de Coco", price: 3000 },
];
export const PAYMENTS = ["BCA Virtual Account", "GoPay / QRIS", "Cash on Delivery"];

export const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

/** Price of one drink: base price plus each chosen known topping. Unknown toppings are ignored. */
export function unitPrice(basePrice: number, toppings: string[]) {
  const chosen = new Set(toppings);
  return basePrice + TOPPINGS.filter((t) => chosen.has(t.name)).reduce((s, t) => s + t.price, 0);
}

/** Normalize an Indonesian phone number to 62xxxxxxxx digits. */
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

export function waLink(number: string, storeName: string) {
  const n = normalizePhone(number);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(`Halo ${storeName}, saya mau pesan jus segar!`)}`;
}

/** ETA label shown to customers for a given status. */
export function etaFor(status: string, s: StoreSettings) {
  switch (status) {
    case "Order Placed": return `${s.eta_placed_mins} mins`;
    case "Preparing": return `${s.eta_preparing_mins} mins`;
    case "On the Way": return `${s.eta_on_the_way_mins} mins`;
    default: return "Arrived";
  }
}
