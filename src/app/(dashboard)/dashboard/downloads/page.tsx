"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileDown, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DownloadItem {
  orderId: string;
  productTitle: string;
  productSlug?: string;
  downloadUrl?: string;
  thumbnail?: string;
  amount: number;
  createdAt: string | null;
}

export default function DownloadsPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = React.useState<DownloadItem[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) { setDataLoading(false); return; }

    async function load() {
      const { db } = await import("@/lib/firebase/client");
      const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore");

      const snap = await getDocs(
        query(collection(db, "orders"), where("userId", "==", user!.uid), orderBy("createdAt", "desc"))
      );

      setItems(snap.docs.map(d => {
        const data = d.data();
        return {
          orderId: d.id,
          productTitle: data.productTitle ?? "Product",
          productSlug: data.productSlug,
          downloadUrl: data.downloadUrl,
          thumbnail: data.thumbnail,
          amount: data.amount ?? 0,
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString("en-IN") ?? null,
        };
      }));
      setDataLoading(false);
    }

    load().catch(() => setDataLoading(false));
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">All your downloadable files in one place. Re-download anytime.</p>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Download className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-semibold">No downloads yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Files from your purchases will appear here</p>
          <Link href="/explore" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.orderId} className="flex items-center gap-4 rounded-xl border bg-card p-4">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.productTitle} className="size-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileDown className="size-6 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.productTitle}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {item.createdAt ?? "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.productSlug && (
                  <Link href={`/product/${item.productSlug}`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
                {item.downloadUrl ? (
                  <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    <Download className="size-3.5" /> Download
                  </a>
                ) : (
                  <span className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">No file</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
