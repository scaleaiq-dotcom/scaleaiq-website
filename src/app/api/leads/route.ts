import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Landing-page free signup: name + phone (no OTP — trust the visitor).
 * One doc per phone number so repeat submits just refresh the record.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 80);
    const rawPhone = String(body.phone ?? "").trim();
    const digits = rawPhone.replace(/\D/g, "");

    if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    await adminDb.collection("leads").doc(digits).set({
      name,
      phone: rawPhone,
      source: String(body.source ?? "landing"),
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("leads error:", err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
