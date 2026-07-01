import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const email = decoded.email ?? "";

    const body = await request.json();
    const { items, couponCode, total, billingName, billingEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Determine if all items are free
    const allFree = items.every((i: { price: number }) => i.price === 0);

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
        price: number; pricingType: string; category: string;
      }) => ({
        productId: item.id,
        slug: item.slug,
        title: item.title,
        price: item.price,
        pricingType: item.pricingType,
        category: item.category,
      })),
      couponCode: couponCode ?? null,
      subtotal: items.reduce((s: number, i: { price: number }) => s + i.price, 0),
      total: total ?? 0,
      currency: "INR",
      status: allFree ? "completed" : "pending",
      paymentMethod: allFree ? "free" : "razorpay",
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

    return NextResponse.json({ orderId, status: order.status });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
