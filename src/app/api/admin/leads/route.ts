import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Every contact the site captures outside Firebase Auth:
 * - leads:      landing signup (name + phone)
 * - freeClaims: guests who left name/email for a free download
 * - notifyList: emails waiting on coming-soon products
 */
export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [leadsSnap, claimsSnap, notifySnap] = await Promise.all([
      adminDb.collection("leads").orderBy("createdAt", "desc").limit(500).get().catch(() => null),
      adminDb.collection("freeClaims").orderBy("createdAt", "desc").limit(500).get().catch(() => null),
      adminDb.collection("notifyList").orderBy("createdAt", "desc").limit(500).get().catch(() => null),
    ]);

    const ts = (d: FirebaseFirestore.DocumentData) =>
      d.createdAt?.toDate?.()?.toISOString() ?? null;

    const leads = (leadsSnap?.docs ?? []).map(d => ({
      id: d.id,
      type: "signup" as const,
      name: d.data().name ?? "",
      email: "",
      phone: d.data().phone ?? "",
      detail: "Landing page signup",
      createdAt: ts(d.data()),
    }));

    const claims = (claimsSnap?.docs ?? [])
      .filter(d => d.data().email || d.data().name)
      .map(d => ({
        id: d.id,
        type: "free_claim" as const,
        name: d.data().name ?? "",
        email: d.data().email ?? "",
        phone: "",
        detail: `Downloaded: ${d.data().productTitle ?? d.data().productId ?? ""}`,
        createdAt: ts(d.data()),
      }));

    const notify = (notifySnap?.docs ?? []).map(d => ({
      id: d.id,
      type: "notify" as const,
      name: "",
      email: d.data().email ?? "",
      phone: "",
      detail: `Waiting for: ${d.data().productTitle ?? d.data().productId ?? ""}`,
      createdAt: ts(d.data()),
    }));

    const all = [...leads, ...claims, ...notify].sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });

    return NextResponse.json({ leads: all });
  } catch (err) {
    console.error("admin leads error:", err);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}
