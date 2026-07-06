import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ reviews: [] });
  try {
    const snap = await adminDb
      .collection("products").doc(productId)
      .collection("reviews")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    const reviews = snap.docs.map(d => ({
      id: d.id,
      name: d.data().name ?? "Anonymous",
      avatar: d.data().avatar ?? "",
      rating: d.data().rating ?? 5,
      comment: d.data().comment ?? "",
      helpful: d.data().helpful ?? 0,
      verified: d.data().verified ?? false,
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, productTitle, name, rating, comment } = await req.json();
    if (!productId || !name || !rating || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    await adminDb.collection("productReviews").add({
      productId: String(productId),
      productTitle: String(productTitle ?? "").slice(0, 120),
      name: String(name).slice(0, 80),
      rating: Number(rating),
      comment: String(comment).slice(0, 500),
      approved: false,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
