import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

type P = Promise<{ id: string }>;

async function recalcRating(productId: string) {
  const snap = await adminDb
    .collection("products").doc(productId)
    .collection("reviews").get();
  if (snap.empty) {
    await adminDb.collection("products").doc(productId).update({ rating: 0, ratingCount: 0 });
    return;
  }
  const total = snap.docs.reduce((s, d) => s + (d.data().rating ?? 0), 0);
  const avg = Math.round((total / snap.size) * 10) / 10;
  await adminDb.collection("products").doc(productId).update({
    rating: avg,
    ratingCount: snap.size,
  });
}

// PATCH: approve or reject a review
// Body: { productId, status: "approved"|"rejected", source?: "pending"|"approved" }
export async function PATCH(req: NextRequest, { params }: { params: P }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { productId, status, source } = await req.json();

  if (!productId || !status) return NextResponse.json({ error: "productId and status required" }, { status: 400 });

  if (source === "pending") {
    // Review is in productReviews collection — pending user submission
    const pendingRef = adminDb.collection("productReviews").doc(id);
    const pendingDoc = await pendingRef.get();
    if (!pendingDoc.exists) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const data = pendingDoc.data()!;

    if (status === "approved") {
      // Copy into products/{id}/reviews subcollection
      await adminDb
        .collection("products").doc(productId)
        .collection("reviews").doc(id)
        .set({
          name: data.name ?? data.userName ?? "Anonymous",
          avatar: (data.name ?? data.userName ?? "A").slice(0, 2).toUpperCase(),
          rating: data.rating ?? 5,
          comment: data.comment ?? "",
          helpful: 0,
          verified: true,
          userId: data.userId ?? "user",
          createdAt: data.createdAt ?? FieldValue.serverTimestamp(),
        });
      // Recalculate product rating
      await recalcRating(productId);
    }

    // Mark pending review as approved/rejected
    await pendingRef.update({ status, updatedAt: FieldValue.serverTimestamp() });

  } else {
    // Review already in products/{id}/reviews — just update status field if needed
    await adminDb
      .collection("products").doc(productId)
      .collection("reviews").doc(id)
      .update({ status, updatedAt: FieldValue.serverTimestamp() });
  }

  return NextResponse.json({ ok: true });
}

// DELETE: remove a review and recalculate rating
export async function DELETE(req: NextRequest, { params }: { params: P }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { productId, source } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  if (source === "pending") {
    await adminDb.collection("productReviews").doc(id).delete();
  } else {
    await adminDb.collection("products").doc(productId).collection("reviews").doc(id).delete();
    await recalcRating(productId);
  }

  return NextResponse.json({ ok: true });
}
