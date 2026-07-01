"use client";

import * as React from "react";
import { ShoppingBag, Search, Download, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string; name: string; email: string; product: string;
  items: { title: string; price: number }[];
  amount: number; status: string; paymentMethod: string;
  createdAt: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600",
  paid:      "bg-emerald-500/10 text-emerald-600",
  pending:   "bg-amber-500/10 text-amber-600",
  refunded:  "bg-rose-500/10 text-rose-600",
  free:      "bg-blue-500/10 text-blue-600",
};

type Filter = "all" | "completed" | "paid" | "pending" | "refunded";

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AdminOrders() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [search, setSearch] = React.useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error();
      const d = await res.json();
      setOrders(d.orders ?? []);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search);
    return matchFilter && matchSearch;
  });

  const totalRevenue = orders
    .filter(o => ["completed","paid"].includes(o.status))
    .reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Orders</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {orders.length} total · ₹{totalRevenue.toLocaleString("en-IN")} revenue
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-52 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search orders…" />
          </div>
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent">
            <Download className="size-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["all","completed","paid","pending","refunded"] as Filter[]).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Customer</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/40" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <ShoppingBag className="mx-auto mb-2 size-12 text-muted-foreground/20" />
                <p className="font-medium text-muted-foreground">
                  {search || filter !== "all" ? "No matching orders" : "No orders yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Orders appear here once customers purchase.</p>
              </td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {o.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{o.name}</p>
                      <p className="text-[10px] text-muted-foreground">{o.email}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{o.product}</td>
                <td className="px-4 py-3 text-sm font-semibold">₹{o.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                    STATUS_STYLES[o.status] ?? "bg-muted text-muted-foreground")}>
                    {o.status}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{timeAgo(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
