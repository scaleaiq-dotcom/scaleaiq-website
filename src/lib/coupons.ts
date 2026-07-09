import { adminDb } from "./firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CouponResult {
  valid: boolean;
  error?: string;
  code?: string;
  discount?: number;
  discountType?: "percent" | "fixed";
  value?: number;
}

/**
 * Resolve a coupon code against the admin-managed `coupons` collection and
 * compute the rupee discount for a given subtotal. Read-only — the single
 * source of truth used by both the checkout validate endpoint and the
 * server-side order total calculation. Never trusts a client-supplied amount.
 */
export async function resolveCoupon(
  code: string | null | undefined,
  subtotal: number,
  productSlug?: string,
): Promise<CouponResult> {
  // Strip ALL whitespace: buyers often type "LAUNCH 50" for "LAUNCH50".
  const normalized = String(code ?? "").replace(/\s+/g, "").toUpperCase();
  const sub = Number(subtotal) || 0;
  if (!normalized) return { valid: false, error: "Enter a coupon code." };

  const snap = await adminDb.collection("coupons").where("code", "==", normalized).limit(1).get();
  if (snap.empty) return { valid: false, error: "Invalid coupon code." };

  const c = snap.docs[0].data();

  if (c.active === false) return { valid: false, error: "This coupon is no longer active." };

  // Product restriction — if the coupon has a productSlugs array, it only
  // works on those specific products.
  if (Array.isArray(c.productSlugs) && c.productSlugs.length > 0) {
    if (!productSlug || !c.productSlugs.includes(productSlug)) {
      return { valid: false, error: "This coupon is not valid for this product." };
    }
  }

  if (c.expiresAt) {
    const exp = new Date(c.expiresAt);
    // Treat the expiry date as end-of-day so a coupon works on its last day.
    exp.setHours(23, 59, 59, 999);
    if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
      return { valid: false, error: "This coupon has expired." };
    }
  }

  const maxUses = Number(c.maxUses) || 0;
  if (maxUses > 0 && Number(c.usageCount ?? 0) >= maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  const minOrder = Number(c.minOrder) || 0;
  if (sub < minOrder) {
    return { valid: false, error: `Minimum order of ₹${minOrder} required for this coupon.` };
  }

  const value = Number(c.value) || 0;
  let discount = c.discountType === "fixed" ? value : Math.round((sub * value) / 100);
  discount = Math.min(discount, sub); // never discount below zero

  return {
    valid: true,
    code: normalized,
    discount,
    discountType: c.discountType ?? "percent",
    value,
  };
}

/**
 * Increment a coupon's usage count after an order completes so `maxUses`
 * limits are actually enforced. Fail-soft — never blocks order completion.
 */
export async function incrementCouponUsage(code: string | null | undefined) {
  // Strip ALL whitespace: buyers often type "LAUNCH 50" for "LAUNCH50".
  const normalized = String(code ?? "").replace(/\s+/g, "").toUpperCase();
  if (!normalized) return;
  try {
    const snap = await adminDb.collection("coupons").where("code", "==", normalized).limit(1).get();
    if (!snap.empty) {
      await snap.docs[0].ref.update({ usageCount: FieldValue.increment(1) });
    }
  } catch (err) {
    console.error("Coupon usage increment failed for", normalized, err);
  }
}
