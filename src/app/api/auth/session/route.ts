import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isAuthorizedAdmin, verifySessionCached } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const auth = await getAdminAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("session");
  return response;
}

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("session")?.value;
    if (!session) return NextResponse.json({ user: null });

    const decoded = await verifySessionCached(session);
    if (!decoded) return NextResponse.json({ user: null });
    const isAdmin = await isAuthorizedAdmin(decoded);
    return NextResponse.json({ user: { uid: decoded.uid, email: decoded.email, isAdmin } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
