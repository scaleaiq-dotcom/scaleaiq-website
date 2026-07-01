import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

type P = Promise<{ id: string }>;

// PATCH: approve or reject a review. Body: { productId, status: "approved"|"rejected" }
export async function PATCH(req: NextRequest, { params }: { params: P }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { productId, ...body } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  await adminDb.collection("products").doc(productId).collection("reviews").doc(id)
    .update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: P }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  await adminDb.collection("products").doc(productId).collection("reviews").doc(id).delete();
  return NextResponse.json({ ok: true });
}
