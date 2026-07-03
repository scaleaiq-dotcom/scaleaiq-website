import { NextRequest, NextResponse } from "next/server";
import { verifySessionCached } from "@/lib/admin-auth";
import { computeCheckoutTotal } from "@/lib/pricing";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Verify auth (cached — the uncached check added ~300-500ms to every Buy tap)
    const decoded = await verifySessionCached(request.cookies.get("session")?.value);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, couponCode, currency = "INR", receipt } = await request.json();

    // Recompute the amount from real product prices — never trust the client's
    // number. This is the amount Razorpay will actually enforce for the order.
    const { total } = await computeCheckoutTotal(items ?? [], couponCode ?? null);

    if (total <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency,
      receipt: receipt ?? `order_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
