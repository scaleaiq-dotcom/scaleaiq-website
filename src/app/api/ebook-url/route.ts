import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";

/**
 * Deliver the full EPUB URL for on-site reading.
 * - Free books: anyone may read the full book.
 * - Paid books: only owners (product present in their library) may read it.
 * The URL is never in the public product payload — it comes only from here.
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId") ?? "";
  if (!productId) return NextResponse.json({ error: "Missing product" }, { status: 400 });

  const snap = await adminDb.collection("products").doc(productId).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const p = snap.data()!;
  const epubUrl = p.epubUrl ?? "";
  if (!epubUrl) return NextResponse.json({ error: "No ebook attached" }, { status: 404 });

  const isFree = (p.pricingType ?? "") === "free" || Number(p.price) === 0;
  if (isFree) return NextResponse.json({ url: epubUrl });

  // Paid → must be signed in and own the product
  const session = await verifySessionCached(req.cookies.get("session")?.value);
  if (!session) return NextResponse.json({ error: "signin_required" }, { status: 401 });

  const lib = await adminDb.collection("users").doc(session.uid).collection("library").doc(productId).get();
  if (!lib.exists) return NextResponse.json({ error: "not_owned" }, { status: 403 });

  return NextResponse.json({ url: epubUrl });
}
