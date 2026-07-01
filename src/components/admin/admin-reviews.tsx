"use client";

import * as React from "react";
import { Star, Check, X, Trash2, Search, Loader2, RefreshCw } from "lucide-react";

interface Review {
  id: string; productId: string; productTitle?: string;
  userName: string; rating: number; comment: string;
  status: "pending" | "approved" | "rejected"; createdAt: string;
}

const FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`size-3 ${i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export function AdminReviews() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter,  setFilter]  = React.useState<typeof FILTERS[number]>("All");
  const [search,  setSearch]  = React.useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews").catch(() => null);
    if (res?.ok) { const d = await res.json(); setReviews(d.reviews ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  async function updateStatus(r: Review, status: "approved" | "rejected") {
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, productId: r.productId }),
    }).catch(() => null);
    await load();
  }

  async function remove(r: Review) {
    await fetch(`/api/admin/reviews/${r.id}?productId=${r.productId}`, { method: "DELETE" }).catch(() => null);
    await load();
  }

  const displayed = reviews.filter(r => {
    const matchFilter = filter === "All" || r.status === filter.toLowerCase();
    const matchSearch = !search || r.userName?.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase()) || r.productTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pending = reviews.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f}{f === "Pending" && pending > 0 ? ` (${pending})` : ""}
            </button>
          ))}
        </div>
        <div className="relative ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-48 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search reviews…" />
          </div>
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Review</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading reviews…
                </div>
              </td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Star className="size-12 text-muted-foreground/20" />
                  <p className="font-medium text-muted-foreground">
                    {search || filter !== "All" ? "No matching reviews" : "No reviews yet"}
                  </p>
                </div>
              </td></tr>
            ) : displayed.map(r => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm font-medium">{r.userName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">{new Date(r.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-sm text-muted-foreground line-clamp-1">{r.productTitle ?? r.productId}</span>
                </td>
                <td className="px-4 py-3"><Stars n={r.rating} /></td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "approved" ? "bg-emerald-500/10 text-emerald-600" :
                    r.status === "rejected" ? "bg-rose-500/10 text-rose-500" :
                    "bg-amber-500/10 text-amber-600"}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {r.status !== "approved" && (
                      <button onClick={() => updateStatus(r, "approved")} title="Approve"
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 active:scale-95">
                        <Check className="size-3.5" />
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button onClick={() => updateStatus(r, "rejected")} title="Reject"
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                        <X className="size-3.5" />
                      </button>
                    )}
                    <button onClick={() => remove(r)} title="Delete"
                      className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
