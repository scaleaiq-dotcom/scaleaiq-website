import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";

/**
 * The signed-in user's library: everything they've claimed or purchased,
 * with live download links (files come from the product, so re-uploads
 * and new files added by the seller appear automatically).
 */
export async function GET(req: NextRequest) {
  const session = await verifySessionCached(req.cookies.get("session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // No orderBy in the query: older records may lack `acquiredAt`
    // and Firestore silently drops docs missing an ordered field.
    const libSnap = await adminDb
      .collection("users").doc(session.uid)
      .collection("library")
      .limit(100)
      .get();

    const items = await Promise.all(libSnap.docs.map(async d => {
      const lib = d.data();
      const prodSnap = await adminDb.collection("products").doc(d.id).get();
      const p = prodSnap.exists ? prodSnap.data()! : {};
      const files = (Array.isArray(p.downloads) ? p.downloads : [])
        .filter((f: Record<string, unknown>) => f.file)
        .map((f: Record<string, unknown>) => ({
          id: f.id,
          type: f.type ?? "File",
          title: (f.title as string) || (f.type as string) || "Download",
          url: f.file,
        }));
      const acquired = lib.acquiredAt ?? lib.accessGrantedAt;
      return {
        productId: d.id,
        title: lib.title ?? p.title ?? "Product",
        slug: p.slug ?? d.id,
        thumbnail: p.thumbnail ?? p.thumbnailUrl ?? "",
        externalUrl: p.launchUrl ?? "",
        paymentMethod: lib.paymentMethod ?? "purchase",
        acquiredAt: acquired?.toDate?.()?.toISOString() ?? null,
        files,
      };
    }));

    items.sort((a, b) => (b.acquiredAt ?? "").localeCompare(a.acquiredAt ?? ""));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Library error:", err);
    return NextResponse.json({ error: "Failed to load library" }, { status: 500 });
  }
}
