import { NextRequest, NextResponse } from "next/server";
import { resolveCoupon } from "@/lib/coupons";

/**
 * Validate a coupon code and return the rupee discount for the given subtotal.
 * Public (used at checkout). The same resolver runs again server-side when the
 * order is placed, so the discount shown here can't be tampered with.
 */
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal, productSlug } = await req.json();
    const result = await resolveCoupon(code, Number(subtotal) || 0, productSlug);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { valid: false, error: "Could not validate coupon. Please try again." },
      { status: 500 },
    );
  }
}
