import { describe, expect, it } from "vitest";
import { etaFor, normalizePhone, unitPrice, DEFAULT_SETTINGS } from "./juice-data";

describe("pricing", () => {
  it("adds topping prices: Chia Rp 5.000, Aloe Rp 4.000, Nata Rp 3.000", () => {
    expect(unitPrice(35000, ["Chia Seeds", "Aloe Vera", "Nata de Coco"])).toBe(47000);
  });
  it("ignores unknown toppings", () => {
    expect(unitPrice(32000, ["Gold Flakes"])).toBe(32000);
  });
});

describe("phone", () => {
  it("converts 08xx to 628xx", () => {
    expect(normalizePhone("0812-3456-7890")).toBe("6281234567890");
  });
});

describe("eta", () => {
  it("delivered shows Arrived", () => {
    expect(etaFor("Delivered", DEFAULT_SETTINGS)).toBe("Arrived");
  });
});
