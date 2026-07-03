import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";
import { sendEmail, orderReceiptHtml, type ReceiptFile } from "@/lib/email";
import { incrementCouponUsage } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const decoded = await verifySessionCached(request.cookies.get("session")?.value);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
        paymentMethod: "purchase",
        acquiredAt: FieldValue.serverTimestamp(),
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

    // Count the coupon toward its usage limit (fail-soft)
    await incrementCouponUsage(couponCode);

    // Receipt email with download links (fire-and-forget)
    (async () => {
      const allFiles: ReceiptFile[] = [];
      let firstExternalUrl: string | undefined;
      for (const item of order.items) {
        const prodSnap = await adminDb.collection("products").doc(item.productId).get();
        const p = prodSnap.exists ? prodSnap.data()! : {};
        (Array.isArray(p.downloads) ? p.downloads : [])
          .filter((f: Record<string, unknown>) => f.file)
          .forEach((f: Record<string, unknown>) => allFiles.push({
            title: `${item.title} — ${(f.title as string) || (f.type as string) || "Download"}`,
            url: f.file as string,
          }));
        if (!firstExternalUrl && p.launchUrl) firstExternalUrl = p.launchUrl;
      }
      await sendEmail({
        to: order.billingEmail || email,
        subject: `Order confirmed: ${order.productTitle} — ScaleAIQ`,
        html: orderReceiptHtml({
          name: order.billingName,
          orderId,
          items: order.items.map((i: { title: string; price: number }) => ({ title: i.title, price: i.price })),
          total: order.total,
          isFree: false,
          files: allFiles,
          externalUrl: firstExternalUrl,
        }),
      });
    })().catch(err => console.error("Receipt email error:", err));

    return NextResponse.json({ orderId, status: "completed" });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

