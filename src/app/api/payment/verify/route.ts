import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = await (await getAdminAuth()).verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const email = decoded.email ?? "";

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      couponCode,
      total,
      billingName,
      billingEmail,
    } = await request.json();

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

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
      items: items.map((item: {
        id: string; slug: string; title: string;
        price: number; pricingType: string; category: string; thumbnailUrl?: string;
      }) => ({
        productId: item.id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        pricingType: item.pricingType,
        category: item.category,
        thumbnail: item.thumbnailUrl ?? null,
      })),
      couponCode: couponCode ?? null,
      subtotal: items.reduce((s: number, i: { price: number }) => s + i.price, 0),
      total,
      currency: "INR",
      status: "completed",
      paymentMethod: "razorpay",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Convenience fields for dashboard queries
      productTitle: items.length === 1 ? items[0].title : `${items.length} products`,
      productSlug: items.length === 1 ? items[0].slug : null,
      amount: total,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("orders").doc(orderId).set(order);

    // Grant library access for all purchased items
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
      batch.update(prodRef, {
        downloadCount: FieldValue.increment(1),
        salesCount: FieldValue.increment(1),
      });
    }
    await batch.commit();

    return NextResponse.json({ orderId, status: "completed" });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

