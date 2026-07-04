import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";

/**
 * Stream an EPUB to the browser from our own origin.
 *
 * The reader (epub.js) fetches the file over XHR, which requires CORS headers.
 * Firebase Storage buckets don't send those by default, so a direct fetch from
 * the browser fails and the reader hangs. Proxying the bytes through our API
 * keeps it same-origin (no CORS), hides the real file URL, and lets us enforce
 * access: previews are public; the full paid book requires ownership.
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId") ?? "";
  const type = req.nextUrl.searchParams.get("type") === "preview" ? "preview" : "full";
  if (!productId) return NextResponse.json({ error: "Missing product" }, { status: 400 });

  const snap = await adminDb.collection("products").doc(productId).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const p = snap.data()!;

  let fileUrl = "";
  if (type === "preview") {
    // Free sample — anyone may read it.
    fileUrl = p.previewEpubUrl ?? "";
  } else {
    fileUrl = p.epubUrl ?? "";
    const isFree = (p.pricingType ?? "") === "free" || Number(p.price) === 0;
    if (!isFree) {
      const session = await verifySessionCached(req.cookies.get("session")?.value);
      if (!session) return NextResponse.json({ error: "signin_required" }, { status: 401 });
      const lib = await adminDb.collection("users").doc(session.uid).collection("library").doc(productId).get();
      if (!lib.exists) return NextResponse.json({ error: "not_owned" }, { status: 403 });
    }
  }

  if (!fileUrl) return NextResponse.json({ error: "No ebook attached" }, { status: 404 });

  // Server-to-server fetch — no CORS restriction here.
  const upstream = await fetch(fileUrl).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Could not load the ebook file" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/epub+zip",
      "Content-Disposition": "inline",
      // Private per-user cache; previews can be cached publicly by the browser.
      "Cache-Control": type === "preview" ? "public, max-age=3600" : "private, max-age=3600",
    },
  });
}
