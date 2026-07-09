import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

type Params = Promise<{ id: string }>;

// Purge the ISR cache for every page that shows this product so admin edits
// (and the editor's Preview) reflect immediately instead of after ~2 minutes.
function revalidateProduct(data: { slug?: string; category?: string }) {
  revalidatePath("/");
  revalidatePath("/explore");
  if (data.slug) revalidatePath(`/product/${data.slug}`);
  if (data.category) revalidatePath(`/category/${data.category}`);
}

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
  if (body.featuredOrder !== undefined && body.featuredOrder !== "") body.featuredOrder = Number(body.featuredOrder);
  else if (body.featuredOrder === "") delete body.featuredOrder;
  await adminDb.collection("products").doc(id).update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  revalidateProduct(body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await adminDb.collection("products").doc(id).get();
  await adminDb.collection("products").doc(id).delete();
  revalidateProduct(existing.data() ?? {});

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
