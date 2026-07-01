import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await (await getAdminAuth()).verifySessionCookie(session, true);
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
    if (!adminEmails.includes(decoded.email ?? "")) return null;
    return decoded;
  } catch { return null; }
}

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
  return NextResponse.json({ ok: true });
}
