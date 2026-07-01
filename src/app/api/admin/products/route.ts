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

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb.collection("products").orderBy("createdAt", "desc").limit(200).get();
    const products = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.seconds ? new Date(d.data().createdAt.seconds * 1000).toISOString() : null }));
    return NextResponse.json({ products });
  } catch (err) {
    console.error("Products fetch error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const ref = adminDb.collection("products").doc();
    await ref.set({ ...body, id: ref.id, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error("Product create error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

