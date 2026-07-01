import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
    if (!adminEmails.includes(decoded.email ?? "")) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}
