import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, productId, productTitle } = await req.json();
    if (!email || !productId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const docId = `${productId}_${email.toLowerCase().replace(/[^a-z0-9@._+-]/g, "_")}`;
    await adminDb.collection("notifyList").doc(docId).set({
      email: email.toLowerCase(),
      productId,
      productTitle: productTitle ?? "",
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify-me error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
