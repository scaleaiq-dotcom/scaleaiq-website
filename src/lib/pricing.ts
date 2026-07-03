import { adminDb } from "./firebase/admin";
import { resolveCoupon } from "./coupons";

export interface OrderLineItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  pricingType: string;
  category: string;
  thumbnailUrl: string | null;
}

export interface CheckoutTotal {
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponApplied: string | null;
  /** IDs the client sent that no longer exist as products (ignored in the total). */
  missingIds: string[];
}

/** Authoritative selling price for a product, mirroring the public docToProduct logic. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function productSellPrice(data: Record<string, any>): number {
  if ((data.pricingType ?? "") === "free") return 0;
  const regular = Number(data.price) || 0;
  const sale = Number(data.salePrice) || 0;
  const hasSale = sale > 0 && sale < regular;
  return hasSale ? sale : regular;
}

/**
 * Recompute an order's total on the server from the product IDs the client
 * sent — never from client-supplied prices. Prices, titles, and the coupon
 * discount all come from Firestore, so a tampered browser payload can't lower
 * the amount charged.
 */
export async function computeCheckoutTotal(
  rawItems: Array<{ id?: string }>,
  couponCode: string | null | undefined,
): Promise<CheckoutTotal> {
  const ids = Array.isArray(rawItems)
    ? rawItems.map((i) => String(i?.id ?? "")).filter(Boolean)
    : [];

  const snaps = await Promise.all(
    ids.map((id) => adminDb.collection("products").doc(id).get()),
  );

  const items: OrderLineItem[] = [];
  const missingIds: string[] = [];
  let subtotal = 0;

  snaps.forEach((snap, i) => {
    if (!snap.exists) {
      missingIds.push(ids[i]);
      return;
    }
    const d = snap.data()!;
    const price = productSellPrice(d);
    subtotal += price;
    items.push({
      id: snap.id,
      slug: d.slug ?? snap.id,
      title: d.title ?? "",
      price,
      pricingType: d.pricingType ?? "paid",
      category: d.category ?? "",
      thumbnailUrl: d.thumbnailUrl ?? d.thumbnail ?? null,
    });
  });

  const coupon = await resolveCoupon(couponCode, subtotal);
  const discount = coupon.valid ? (coupon.discount ?? 0) : 0;
  const total = Math.max(0, subtotal - discount);

  return {
    items,
    subtotal,
    discount,
    total,
    couponApplied: coupon.valid ? (coupon.code ?? null) : null,
    missingIds,
  };
}
