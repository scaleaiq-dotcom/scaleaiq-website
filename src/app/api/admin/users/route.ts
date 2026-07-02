import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const list = await (await getAdminAuth()).listUsers(1000);
    const users = list.users.map(u => ({
      uid: u.uid,
      name: u.displayName ?? "",
      email: u.email ?? "",
      avatar: (u.displayName ?? u.email ?? "?").slice(0, 2).toUpperCase(),
      photoURL: u.photoURL ?? null,
      createdAt: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime,
      disabled: u.disabled,
    }));
    return NextResponse.json({ users });
  } catch (err) {
    console.error("List users error:", err);
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

