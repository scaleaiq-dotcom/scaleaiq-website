import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

const DEFAULT_ROLES = [
  { name: "Super Admin", description: "Full access to everything", color: "violet", members: [], permissions: {}, protected: true, order: 1 },
  { name: "Editor",      description: "Can manage products and content", color: "blue", members: [], permissions: {}, protected: false, order: 2 },
  { name: "Support",     description: "Can view orders and manage support tickets", color: "green", members: [], permissions: {}, protected: false, order: 3 },
];

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let snap = await adminDb.collection("roles").orderBy("order").get();
  if (snap.empty) {
    const batch = adminDb.batch();
    DEFAULT_ROLES.forEach(r => {
      const ref = adminDb.collection("roles").doc();
      batch.set(ref, { ...r, createdAt: FieldValue.serverTimestamp() });
    });
    await batch.commit();
    snap = await adminDb.collection("roles").orderBy("order").get();
  }
  const roles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ roles });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const snap = await adminDb.collection("roles").get();
  const ref = await adminDb.collection("roles").add({ ...body, members: [], order: snap.size + 1, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ id: ref.id });
}
