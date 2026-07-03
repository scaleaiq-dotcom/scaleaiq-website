"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Package, Loader2, RefreshCw, Edit2, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareMenu } from "@/components/admin/share-menu";

interface Product {
  id: string; title: string; slug: string; category: string;
  productType: string; status: string; price: string; pricingType: string;
  thumbnail: string; createdAt: string | null;
}

type Status = "all" | "published" | "draft" | "coming_soon" | "archived";

const STATUS_STYLES: Record<string, string> = {
  published:   "bg-emerald-500/10 text-emerald-600",
  draft:       "bg-muted text-muted-foreground",
  coming_soon: "bg-amber-500/10 text-amber-600",
  archived:    "bg-rose-500/10 text-rose-600",
};

export function AdminProductList() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<Status>("all");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [seeding, setSeeding] = React.useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error();
      const d = await res.json();
      setProducts(d.products ?? []);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts(p => p.filter(x => x.id !== id));
    } catch {
      alert("Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  }

  async function seedProducts() {
    if (!confirm("Import 30 sample products from the website mock data? Duplicates will be skipped.")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed-products", { method: "POST" });
      const d = await res.json();
      alert(`Done! Added ${d.added} products, skipped ${d.skipped} duplicates.`);
      await load();
    } catch {
      alert("Seed failed.");
    } finally {
      setSeeding(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.productType.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const FILTERS: { value: Status; label: string }[] = [
    { value: "all",         label: `All (${products.length})` },
    { value: "published",   label: `Published (${products.filter(p => p.status === "published").length})` },
    { value: "draft",       label: `Draft (${products.filter(p => p.status === "draft").length})` },
    { value: "coming_soon", label: `Coming Soon (${products.filter(p => p.status === "coming_soon").length})` },
    { value: "archived",    label: `Archived (${products.filter(p => p.status === "archived").length})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Products</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-52 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search products…" />
          </div>
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={seedProducts} disabled={seeding || loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
            {seeding ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Import Sample
          </button>
          <Link href="/admin/products/new"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)}
            className={cn("cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Product</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground sm:table-cell">Category</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/40" />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <Package className="mx-auto mb-2 size-12 text-muted-foreground/20" />
                <p className="font-medium text-muted-foreground">
                  {search || statusFilter !== "all" ? "No matching products" : "No products yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {!search && statusFilter === "all" && (
                    <Link href="/admin/products/new" className="text-primary hover:underline">Add your first product →</Link>
                  )}
                </p>
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="size-9 rounded-lg object-cover border" />
                    ) : (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {p.title?.[0] ?? "P"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      <p className="truncate text-[10px] text-muted-foreground">/product/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">{p.category || "—"}</td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{p.productType || "—"}</td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {p.pricingType === "free" ? <span className="text-emerald-600">Free</span>
                    : p.price ? `₹${parseInt(p.price).toLocaleString("en-IN")}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                    STATUS_STYLES[p.status] ?? "bg-muted text-muted-foreground")}>
                    {p.status?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <ShareMenu title={p.title} url={`https://www.scaleaiq.in/product/${p.slug}`} />
                    <Link href={`/admin/products/${p.id}`}
                      className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <Edit2 className="size-3.5" />
                    </Link>
                    <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id}
                      className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50">
                      {deleting === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
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
