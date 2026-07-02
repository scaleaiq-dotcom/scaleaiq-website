import { NextRequest } from "next/server";
import { getAdminAuth, adminDb } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean);

// Role membership cache — avoids hitting Firestore on every admin request.
let roleMembersCache: { uids: Set<string>; expires: number } | null = null;

async function getRoleMemberUids(): Promise<Set<string>> {
  if (roleMembersCache && roleMembersCache.expires > Date.now()) return roleMembersCache.uids;
  const uids = new Set<string>();
  try {
    const snap = await adminDb.collection("roles").get();
    snap.docs.forEach(d => {
      const data = d.data();
      const members: string[] = data.memberIds ?? data.members ?? [];
      members.forEach((uid: string) => uids.add(uid));
    });
  } catch {
    // If roles can't be read, fall back to env admins only.
  }
  roleMembersCache = { uids, expires: Date.now() + 60_000 };
  return uids;
}

export async function isAuthorizedAdmin(decoded: DecodedIdToken): Promise<boolean> {
  if (ADMIN_EMAILS.includes(decoded.email ?? "")) return true;
  const roleUids = await getRoleMemberUids();
  return roleUids.has(decoded.uid);
}

// Session verification cache — verifySessionCookie(_, true) makes a network
// round-trip to Firebase on every call, which made every admin page slow.
// Verify with revocation check once, then trust the result for 5 minutes.
const sessionCache = new Map<string, { decoded: DecodedIdToken; expires: number }>();

function cacheKey(session: string): string {
  // Session cookies are long; the last 64 chars include the signature.
  return session.slice(-64);
}

/** Verify a session cookie with the 5-minute cache. Works for any signed-in user. */
export async function verifySessionCached(session: string | undefined): Promise<DecodedIdToken | null> {
  if (!session) return null;

  const key = cacheKey(session);
  const cached = sessionCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.decoded;

  try {
    const auth = await getAdminAuth();
    const decoded = await auth.verifySessionCookie(session, true);
    // Evict stale entries opportunistically
    if (sessionCache.size > 500) {
      for (const [k, v] of sessionCache) if (v.expires <= Date.now()) sessionCache.delete(k);
    }
    sessionCache.set(key, { decoded, expires: Date.now() + 5 * 60_000 });
    return decoded;
  } catch {
    sessionCache.delete(key);
    return null;
  }
}

/** Verify the session cookie AND that the user is an admin (env email or role member). */
export async function verifyAdminSession(session: string | undefined): Promise<DecodedIdToken | null> {
  const decoded = await verifySessionCached(session);
  if (!decoded) return null;
  return (await isAuthorizedAdmin(decoded)) ? decoded : null;
}

export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const decoded = await verifyAdminSession(req.cookies.get("session")?.value);
  return decoded?.uid ?? null;
}
