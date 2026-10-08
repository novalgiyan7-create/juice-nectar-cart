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
  customer: string;
  items: string;
  total: number;
  status: string;
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
export const WA_URL =
  "https://wa.me/6281234567890?text=Halo%20FreshSqueeze,%20saya%20mau%20pesan%20jus%20segar!";

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Green Glow Detox", category: "Detox", price: 35000, tag: "Organic", description: "Kale, spinach, green apple, cucumber, lemon, and ginger for ultimate cleansing.", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Tropical Sunrise", category: "Tropical", price: 32000, tag: "Bestseller", description: "Fresh mango, pineapple, passion fruit, and a hint of mint.", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Power Protein Banana", category: "Protein Booster", price: 40000, tag: "High Protein", description: "Whey protein, banana, peanut butter, oat milk, and chia seeds.", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Berry Immunity Blast", category: "Detox", price: 38000, tag: "Sugar-Free", description: "Strawberry, blueberry, raspberry, beet, and coconut water.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80" },
];

export const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

/** Placeholder webhook hook — connect Make.com / n8n / API here later. */
export async function submitToWebhook(type: string, payload: unknown) {
  console.info(`[webhook:${type}]`, payload);
}
