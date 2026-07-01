import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Fetch reviews from all products' subcollections
  const productsSnap = await adminDb.collection("products").get();
  const reviews: Record<string, unknown>[] = [];
  await Promise.all(productsSnap.docs.map(async (productDoc) => {
    const revSnap = await adminDb.collection("products").doc(productDoc.id).collection("reviews").get();
    revSnap.docs.forEach(d => {
      reviews.push({
        id: d.id,
        productId: productDoc.id,
        productTitle: productDoc.data().title ?? "",
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
      });
    });
  }));
  reviews.sort((a, b) => {
    const at = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0;
    const bt = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });
  return NextResponse.json({ reviews });
}
