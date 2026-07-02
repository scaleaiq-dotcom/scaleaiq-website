"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileDown, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface LibraryFile {
  id: string;
  type: string;
  title: string;
  url: string;
}

interface LibraryItem {
  productId: string;
  title: string;
  slug: string;
  thumbnail?: string;
  externalUrl?: string;
  paymentMethod: string;
  acquiredAt: string | null;
  files: LibraryFile[];
}

export default function DownloadsPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = React.useState<LibraryItem[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (loading) return;
    if (!user) { setDataLoading(false); return; }

    fetch("/api/my-library")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setItems(d.items ?? []))
      .catch(() => setError("Could not load your library. Please refresh."))
      .finally(() => setDataLoading(false));
  }, [user, loading]);

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Everything you&apos;ve claimed or purchased — re-download anytime. New files added by the seller appear here automatically.
      </p>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {items.length === 0 && !error ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Download className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold">Your library is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Free claims and purchases will appear here</p>
          <Link href="/explore" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.productId} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail} alt={item.title} className="size-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileDown className="size-6 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.slug}`} className="truncate font-medium hover:text-primary">
                    {item.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {item.acquiredAt ? new Date(item.acquiredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    <span className={item.paymentMethod === "free"
                      ? "rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-600"
                      : "rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"}>
                      {item.paymentMethod === "free" ? "FREE" : "PURCHASED"}
                    </span>
                  </div>
                </div>
                {item.externalUrl && (
                  <a href={item.externalUrl} target="_blank" rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    <ExternalLink className="size-3.5" /> Open App
                  </a>
                )}
              </div>

              {item.files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                  {item.files.map(f => (
                    <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" download
                      className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                      <Download className="size-3.5" /> {f.title}
                      <span className="rounded bg-card px-1 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">{f.type}</span>
                    </a>
                  ))}
                </div>
              )}
              {item.files.length === 0 && !item.externalUrl && (
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">No files attached yet — check back soon.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
