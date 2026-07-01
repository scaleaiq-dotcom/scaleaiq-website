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
    const [products, orders, users] = await Promise.all([
      adminDb.collection("products").count().get(),
      adminDb.collection("orders").get(),
      adminDb.collection("users").count().get(),
    ]);

    const orderDocs = orders.docs.map(d => d.data());
    const revenue = orderDocs.filter(o => o.status === "completed" || o.status === "paid")
      .reduce((s, o) => s + (o.total ?? 0), 0);
    const downloads = orderDocs.filter(o => o.paymentMethod === "free").length;

    const recentOrders = orderDocs
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        name: o.billingName || o.userEmail || "Unknown",
        email: o.userEmail,
        product: o.items?.[0]?.title ?? "—",
        amount: `₹${(o.total ?? 0).toLocaleString("en-IN")}`,
        status: o.status,
        createdAt: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : null,
      }));

    const recentActivity = orderDocs
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 5)
      .map(o => ({
        text: `${o.billingName || o.userEmail} purchased ${o.items?.[0]?.title ?? "a product"}`,
        createdAt: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : null,
      }));

    return NextResponse.json({
      products: products.data().count,
      orders: orderDocs.length,
      users: users.data().count,
      revenue,
      downloads,
      recentOrders,
      recentActivity,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
