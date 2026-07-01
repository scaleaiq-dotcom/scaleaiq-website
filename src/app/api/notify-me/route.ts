import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, category } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    await adminDb.collection("notifyMe").add({
      email: String(email).slice(0, 200),
      category: String(category ?? "general").slice(0, 80),
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
