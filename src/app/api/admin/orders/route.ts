import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";

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

