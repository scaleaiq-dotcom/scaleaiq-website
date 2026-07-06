import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Pending reviews from productReviews collection (user submissions awaiting approval)
  const pendingSnap = await adminDb
    .collection("productReviews")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const pending = pendingSnap.docs.map(d => ({
    id: d.id,
    source: "pending",
    productId: d.data().productId ?? "",
    productTitle: d.data().productTitle ?? "",
    userName: d.data().name ?? d.data().userName ?? "Anonymous",
    rating: d.data().rating ?? 5,
    comment: d.data().comment ?? "",
    status: d.data().status ?? "pending",
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
  }));

  // Approved reviews already in products/{id}/reviews subcollections
  const productsSnap = await adminDb.collection("products").get();
  const approved: Record<string, unknown>[] = [];
  await Promise.all(productsSnap.docs.map(async (productDoc) => {
    const revSnap = await adminDb
      .collection("products").doc(productDoc.id)
      .collection("reviews")
      .where("userId", "!=", "seeded")
      .get();
    revSnap.docs.forEach(d => {
      approved.push({
        id: d.id,
        source: "approved",
        productId: productDoc.id,
        productTitle: productDoc.data().title ?? "",
        userName: d.data().name ?? "Anonymous",
        rating: d.data().rating ?? 5,
        comment: d.data().comment ?? "",
        status: "approved",
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
      });
    });
  }));

  const all = [...pending, ...approved].sort((a, b) => {
    const at = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
    const bt = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });

  return NextResponse.json({ reviews: all });
}
