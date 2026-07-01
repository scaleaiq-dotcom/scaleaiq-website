import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

async function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
    if (!adminEmails.includes(decoded.email ?? "")) return null;
    return decoded;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(100).get();
    const orders = snap.docs.map(d => {
      const o = d.data();
      return {
        id: d.id,
        name: o.billingName || o.userEmail || "Unknown",
        email: o.userEmail,
        product: o.items?.[0]?.title ?? "—",
        items: o.items ?? [],
        amount: o.total ?? 0,
        status: o.status ?? "pending",
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : null,
      };
    });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
