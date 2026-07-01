import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  // Verify webhook signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSig !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    // Find order by razorpay_order_id and mark as completed
    const snap = await adminDb.collection("orders")
      .where("razorpay_order_id", "==", payment.order_id)
      .limit(1)
      .get();

    if (!snap.empty) {
      await snap.docs[0].ref.update({
        status: "completed",
        razorpay_payment_id: payment.id,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    const snap = await adminDb.collection("orders")
      .where("razorpay_order_id", "==", payment.order_id)
      .limit(1)
      .get();

    if (!snap.empty) {
      await snap.docs[0].ref.update({
        status: "failed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
