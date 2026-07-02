import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const doc = await adminDb.collection("products").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: { id: doc.id, ...doc.data() } });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  await adminDb.collection("products").doc(id).update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await adminDb.collection("products").doc(id).delete();

  // Free up storage: remove every file uploaded under this product
  // (thumbnails, banners, downloads). Fail-soft — the product is already
  // deleted; leftover files can still be cleaned in File Manager.
  try {
    await adminStorage.bucket().deleteFiles({ prefix: `products/${id}/` });
  } catch (err) {
    console.error("Storage cleanup failed for product", id, err);
  }

  return NextResponse.json({ ok: true });
}
