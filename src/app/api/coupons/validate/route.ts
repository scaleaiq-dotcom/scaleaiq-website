import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Validate a coupon code against the admin-managed `coupons` collection.
 * Returns the rupee discount for the given subtotal, or an error message.
 * Public (used at checkout) — read-only, does not consume the coupon.
 */
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const normalized = String(code ?? "").trim().toUpperCase();
    const sub = Number(subtotal) || 0;
    if (!normalized) return NextResponse.json({ valid: false, error: "Enter a coupon code." });

    const snap = await adminDb.collection("coupons").where("code", "==", normalized).limit(1).get();
    if (snap.empty) return NextResponse.json({ valid: false, error: "Invalid coupon code." });

    const c = snap.docs[0].data();

    if (c.active === false) return NextResponse.json({ valid: false, error: "This coupon is no longer active." });

    if (c.expiresAt) {
      const exp = new Date(c.expiresAt);
      // Treat the expiry date as end-of-day so a coupon works on its last day.
      exp.setHours(23, 59, 59, 999);
      if (!isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
        return NextResponse.json({ valid: false, error: "This coupon has expired." });
      }
    }

    const maxUses = Number(c.maxUses) || 0;
    if (maxUses > 0 && Number(c.usageCount ?? 0) >= maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit." });
    }

    const minOrder = Number(c.minOrder) || 0;
    if (sub < minOrder) {
      return NextResponse.json({ valid: false, error: `Minimum order of ₹${minOrder} required for this coupon.` });
    }

    const value = Number(c.value) || 0;
    let discount = c.discountType === "fixed" ? value : Math.round((sub * value) / 100);
    discount = Math.min(discount, sub); // never discount below zero

    return NextResponse.json({
      valid: true,
      code: normalized,
      discount,
      discountType: c.discountType ?? "percent",
      value,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Could not validate coupon. Please try again." }, { status: 500 });
  }
}
