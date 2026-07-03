import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { incrementCouponUsage } from "@/lib/coupons";
import { computeCheckoutTotal } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await (await getAdminAuth()).verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const email = decoded.email ?? "";

    const body = await request.json();
    const { items: rawItems, couponCode, billingName, billingEmail } = body;

    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Recompute from Firestore. This endpoint is the free path only — if the
    // real total isn't ₹0, reject and make the buyer go through payment.
    const computed = await computeCheckoutTotal(rawItems, couponCode ?? null);
    const items = computed.items;
    const total = computed.total;
    if (total > 0) {
      return NextResponse.json({ error: "These items require payment." }, { status: 400 });
    }
    const allFree = true;

    // Create a clean, readable order ID: SAIQ-YYYYMMDD-XXXX
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SAIQ-${datePart}-${randPart}`;
    const order = {
      id: orderId,
      userId: uid,
      userEmail: email,
      billingName: billingName ?? decoded.name ?? "",
      billingEmail: billingEmail ?? email,
      items: items.map((item) => ({
        productId: item.id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        pricingType: item.pricingType,
        category: item.category,
      })),
      couponCode: computed.couponApplied,
      subtotal: computed.subtotal,
      total,
      currency: "INR",
      status: "completed",
      paymentMethod: "free",
      paymentId: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("orders").doc(orderId).set(order);

    // For free orders — also write to user's library immediately
    if (allFree) {
      const batch = adminDb.batch();
      for (const item of order.items) {
        const libRef = adminDb
          .collection("users").doc(uid)
          .collection("library").doc(item.productId);
        batch.set(libRef, {
          productId: item.productId,
          slug: item.slug,
          title: item.title,
          category: item.category,
          orderId,
          accessGrantedAt: FieldValue.serverTimestamp(),
        });

        // Increment product download count
        const prodRef = adminDb.collection("products").doc(item.productId);
        batch.update(prodRef, { downloadCount: FieldValue.increment(1) });
      }
      await batch.commit();
    }

    // Count the coupon toward its usage limit (only if it actually applied)
    await incrementCouponUsage(computed.couponApplied);

    return NextResponse.json({ orderId, status: order.status });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

