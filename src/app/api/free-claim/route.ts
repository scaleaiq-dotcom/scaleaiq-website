import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";
import { sendEmail, orderReceiptHtml } from "@/lib/email";

/**
 * Claim a free product.
 * - Product must actually be free.
 * - access === "login_required": a signed-in session is mandatory (protects big files);
 *   the claim email is taken from the account, not the form.
 * - One claim per email per product; re-claiming returns the same files.
 * - Records a ₹0 order (shows in admin Orders). Free items download directly
 *   to the buyer's device — they do NOT go to My Library (purchases only).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.productId ?? "");
    if (!productId) return NextResponse.json({ error: "Missing product" }, { status: 400 });

    const snap = await adminDb.collection("products").doc(productId).get();
    if (!snap.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = snap.data()!;

    const isFree = (product.pricingType ?? "") === "free" || Number(product.price) === 0;
    const isFreemium = !isFree && product.freeEnabled === true && body.freeTier === true;
    if (!isFree && !isFreemium) return NextResponse.json({ error: "This product is not free" }, { status: 400 });

    // Who is claiming?
    const session = await verifySessionCached(req.cookies.get("session")?.value);
    const requiresLogin = (product.access ?? "public") === "login_required"
      || (product.access ?? "") === "purchase_required";

    let email: string;
    let name: string;
    if (requiresLogin) {
      // Protected free product: Google sign-in ONLY.
      if (!session) {
        return NextResponse.json({ error: "signin_required" }, { status: 401 });
      }
      const provider = (session.firebase?.sign_in_provider ?? "") as string;
      if (provider !== "google.com") {
        return NextResponse.json({ error: "google_required" }, { status: 403 });
      }
      email = session.email ?? "";
      name = (session.name as string) ?? "";
    } else if (session) {
      email = session.email ?? "";
      name = (session.name as string) ?? String(body.name ?? "").trim();
    } else {
      // Open free product: name/email are OPTIONAL — guests may skip.
      email = String(body.email ?? "").trim().toLowerCase();
      name = String(body.name ?? "").trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "That email doesn't look valid" }, { status: 400 });
      }
    }
    const emailKey = email.toLowerCase().replace(/[^a-z0-9@._+-]/g, "_");

    // Files the buyer receives (real URLs — only returned by this endpoint)
    // For freemium free-tier claims: deliver only freeFiles, not the full product
    const files = isFreemium
      ? (Array.isArray(product.freeFiles) ? product.freeFiles : [])
          .filter((f: Record<string, unknown>) => f.url)
          .map((f: Record<string, unknown>) => ({
            id: String(f.id ?? ""), type: "File",
            title: (f.title as string) || "Free Sample",
            url: f.url,
          }))
      : (Array.isArray(product.downloads) ? product.downloads : [])
          .filter((d: Record<string, unknown>) => d.file)
          .map((d: Record<string, unknown>) => ({
            id: d.id, type: d.type ?? "File", title: (d.title as string) || (d.type as string) || "Download",
            url: d.file,
          }));
    const externalUrl = product.launchUrl ?? "";

    // One claim per email per product (only enforceable when we have an email)
    const claimRef = email
      ? adminDb.collection("freeClaims").doc(`${productId}_${emailKey}`)
      : null;
    if (claimRef) {
      const existing = await claimRef.get();
      if (existing.exists) {
        return NextResponse.json({
          ok: true, alreadyClaimed: true, files, externalUrl,
          orderId: existing.data()?.orderId ?? null,
        });
      }
    }

    // Record the ₹0 order, the claim, and the download count in parallel —
    // sequential writes made the "Preparing your download" step slow on mobile.
    const orderRef = adminDb.collection("orders").doc();
    const writes: Promise<unknown>[] = [
      orderRef.set({
        id: orderRef.id,
        userId: session?.uid ?? null,
        userEmail: email || "guest",
        billingName: name || (email ? email.split("@")[0] : "Guest"),
        items: [{ productId, title: product.title ?? "", price: 0, freeTier: isFreemium }],
        total: 0,
        status: "completed",
        paymentMethod: isFreemium ? "free_tier" : "free",
        createdAt: FieldValue.serverTimestamp(),
      }),
      snap.ref.update({ downloadCount: FieldValue.increment(1) }).catch(() => {}),
    ];
    if (claimRef) {
      writes.push(claimRef.set({
        productId,
        productTitle: product.title ?? "",
        email,
        name,
        userId: session?.uid ?? null,
        orderId: orderRef.id,
        createdAt: FieldValue.serverTimestamp(),
      }));
    }
    await Promise.all(writes);

    // Receipt email (fire-and-forget — never blocks the download)
    if (email) {
      sendEmail({
        to: email,
        subject: `Your free download: ${product.title ?? "ScaleAIQ product"}`,
        html: orderReceiptHtml({
          name,
          orderId: orderRef.id,
          items: [{ title: product.title ?? "Product", price: 0 }],
          total: 0,
          isFree: true,
          files: files.map(f => ({ title: String(f.title), url: String(f.url) })),
          externalUrl: externalUrl || undefined,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, alreadyClaimed: false, files, externalUrl, orderId: orderRef.id });
  } catch (err) {
    console.error("Free claim error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
