import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

type P = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: P }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  await adminDb.collection("roles").doc(id).update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: P }) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const doc = await adminDb.collection("roles").doc(id).get();
  if (doc.data()?.protected) return NextResponse.json({ error: "Cannot delete protected role" }, { status: 403 });
  await adminDb.collection("roles").doc(id).delete();
  return NextResponse.json({ ok: true });
}
