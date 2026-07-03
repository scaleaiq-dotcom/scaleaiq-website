import { adminDb } from "./firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Increment a coupon's usage count after an order completes so `maxUses`
 * limits are actually enforced. Fail-soft — never blocks order completion.
 */
export async function incrementCouponUsage(code: string | null | undefined) {
  const normalized = String(code ?? "").trim().toUpperCase();
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
