"use client";

import * as React from "react";
import {
  HardDrive, Loader2, Trash2, FileText, FileArchive, FileSpreadsheet,
  Music, Film, ImageIcon, File, RefreshCw, Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StorageFile {
  path: string;
  size: number;
  contentType: string;
  updated: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return ImageIcon;
  if (contentType.startsWith("audio/")) return Music;
  if (contentType.startsWith("video/")) return Film;
  if (contentType.includes("pdf")) return FileText;
  if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("compressed")) return FileArchive;
  if (contentType.includes("sheet") || contentType.includes("csv") || contentType.includes("excel")) return FileSpreadsheet;
  return File;
}

export function FileManagerClient() {
  const [files, setFiles] = React.useState<StorageFile[]>([]);
  const [totalBytes, setTotalBytes] = React.useState(0);
  const [quotaBytes, setQuotaBytes] = React.useState(1024 ** 3);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/storage").catch(() => null);
    if (res?.ok) {
      const d = await res.json();
      setFiles(d.files ?? []);
      setTotalBytes(d.totalBytes ?? 0);
      setQuotaBytes(d.quotaBytes ?? 1024 ** 3);
    } else {
      setError("Could not load storage. Make sure Firebase Storage is enabled.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function handleDelete(path: string) {
    if (!confirm(`Delete "${path.split("/").pop()}"?\n\nAny product still linking to this file will break. This cannot be undone.`)) return;
    setDeleting(path);
    const res = await fetch("/api/admin/storage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => null);
    if (res?.ok) {
      setFiles(f => f.filter(x => x.path !== path));
      setTotalBytes(t => t - (files.find(f => f.path === path)?.size ?? 0));
    } else {
      alert("Delete failed. Please try again.");
    }
    setDeleting(null);
  }

  const pct = Math.min((totalBytes / quotaBytes) * 100, 100);
  const meterColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-primary";

  // Group files by top-level folder
  const groups = files.reduce<Record<string, StorageFile[]>>((acc, f) => {
    const folder = f.path.includes("/") ? f.path.split("/")[0] : "(root)";
    (acc[folder] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">File Manager</h1>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 size-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Storage meter */}
      <div className="mb-6 rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HardDrive className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold">Storage Used</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{formatBytes(totalBytes)}</span>
                {" "}of {formatBytes(quotaBytes)} ({pct.toFixed(1)}%)
              </p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all", meterColor)} style={{ width: `${Math.max(pct, 0.5)}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {files.length} file{files.length === 1 ? "" : "s"} · Free allowance on your Blaze plan is 1 GB stored + 10 GB bandwidth/month. Delete unused files below to free space.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Loading files…
        </div>
      ) : files.length === 0 && !error ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No files uploaded yet</p>
          <p className="mt-1 text-sm">Files you upload in the product editor (Media &amp; Downloads tabs) appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([folder, items]) => (
            <div key={folder}>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                <Folder className="size-4" /> {folder}
                <span className="font-normal">· {items.length} file{items.length === 1 ? "" : "s"} · {formatBytes(items.reduce((s, f) => s + f.size, 0))}</span>
              </p>
              <div className="overflow-hidden rounded-xl border bg-card">
                {items.map((f, i) => {
                  const Icon = fileIcon(f.contentType);
                  const name = f.path.split("/").pop() ?? f.path;
                  return (
                    <div key={f.path} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t")}>
                      <Icon className="size-4.5 shrink-0 text-primary/70" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(f.size)}
                          {f.updated && <> · {new Date(f.updated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(f.path)}
                        disabled={deleting === f.path}
                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        aria-label={`Delete ${name}`}
                      >
                        {deleting === f.path ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
