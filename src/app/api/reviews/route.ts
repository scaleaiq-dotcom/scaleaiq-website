import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { name, rating, comment } = await req.json();
    if (!name || !rating || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    await adminDb.collection("siteReviews").add({
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

export async function GET() {
  const snap = await adminDb
    .collection("siteReviews")
    .where("approved", "==", true)
    .orderBy("createdAt", "desc")
    .limit(12)
    .get();
  const reviews = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
  }));
  return NextResponse.json({ reviews });
}
