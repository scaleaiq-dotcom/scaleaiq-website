import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles();

    let totalBytes = 0;
    const list = files.map(f => {
      const size = Number(f.metadata.size ?? 0);
      totalBytes += size;
      return {
        path: f.name,
        size,
        contentType: f.metadata.contentType ?? "",
        updated: f.metadata.updated ?? null,
      };
    });

    // Newest first
    list.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));

    // Blaze plan free allowance is 1 GB stored (region-dependent).
    // Override with STORAGE_QUOTA_GB env var if your allowance differs.
    const quotaGb = Number(process.env.STORAGE_QUOTA_GB) || 1;
    return NextResponse.json({
      files: list,
      totalBytes,
      quotaBytes: quotaGb * 1024 * 1024 * 1024,
    });
  } catch (err) {
    console.error("Storage list error:", err);
    return NextResponse.json({ error: "Failed to list files. Is Firebase Storage enabled?" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { path } = await req.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Missing file path" }, { status: 400 });
    }
    await adminStorage.bucket().file(path).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Storage delete error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
