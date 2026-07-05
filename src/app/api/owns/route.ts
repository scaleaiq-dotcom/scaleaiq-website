import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";

/**
 * Does the signed-in user already own this product?
 * Used by the product page to swap Buy buttons for "You own this".
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId") ?? "";
  if (!productId) return NextResponse.json({ owned: false });

  const session = await verifySessionCached(req.cookies.get("session")?.value);
  if (!session) return NextResponse.json({ owned: false });

  try {
    const lib = await adminDb
      .collection("users").doc(session.uid)
      .collection("library").doc(productId).get();
    return NextResponse.json({ owned: lib.exists });
  } catch {
    return NextResponse.json({ owned: false });
  }
}
