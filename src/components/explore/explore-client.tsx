"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, LayoutGrid, LayoutList, X, Loader2, Package } from "lucide-react";
import type { Category, Product, PricingType } from "@/types/product";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "popular",    label: "Most Popular" },
  { value: "rating",     label: "Top Rated" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const PRICE_FILTERS: { value: PricingType | "all"; label: string }[] = [
  { value: "all",      label: "All Prices" },
  { value: "free",     label: "Free" },
  { value: "one_time", label: "Paid" },
];

export function ExploreClient({ categories }: { categories: Category[] }) {
  const params = useSearchParams();

  const [search,      setSearch]      = React.useState(params.get("q")        ?? "");
  const [category,    setCategory]    = React.useState(params.get("category") ?? "all");
  const [priceFilter, setPriceFilter] = React.useState<PricingType | "all">((params.get("price") as PricingType | "all") ?? "all");
  const [sort,        setSort]        = React.useState(params.get("sort")     ?? "newest");
  const [view,        setView]        = React.useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = React.useState(false);

  const [products, setProducts] = React.useState<Product[]>([]);
  const [total,    setTotal]    = React.useState(0);
  const [loading,  setLoading]  = React.useState(true);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({
      ...(category !== "all" ? { category } : {}),
      ...(priceFilter !== "all" ? { pricing: priceFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      sort,
      limit: "48",
    });
    fetch(`/api/products?${qs}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setTotal(d.total ?? 0); })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [category, priceFilter, debouncedSearch, sort]);

  return (
    <div className="space-y-4">
      {/* Search + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, categories, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 pl-9 pr-4"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className="gap-2">
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="h-9 cursor-pointer rounded-md border bg-background px-3 text-sm">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex rounded-md border">
            <button onClick={() => setView("grid")}
              className={cn("flex size-9 cursor-pointer items-center justify-center rounded-l-md transition-colors", view === "grid" ? "bg-accent" : "hover:bg-accent/50")}>
              <LayoutGrid className="size-4" />
            </button>
            <button onClick={() => setView("list")}
              className={cn("flex size-9 cursor-pointer items-center justify-center rounded-r-md border-l transition-colors", view === "list" ? "bg-accent" : "hover:bg-accent/50")}>
              <LayoutList className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                <Chip active={category === "all"} onClick={() => setCategory("all")}>All</Chip>
                {categories.map(c => (
                  <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</p>
              <div className="flex gap-2">
                {PRICE_FILTERS.map(f => (
                  <Chip key={f.value} active={priceFilter === f.value} onClick={() => setPriceFilter(f.value)}>{f.label}</Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category pill bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>All</Chip>
        {categories.map(c => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</Chip>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid / List */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Package className="size-12 text-muted-foreground/30" />
          <p className="font-semibold">No products found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category.</p>
          <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); setPriceFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className={view === "grid"
          ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "flex flex-col gap-3"}>
          {products.map(p =>
            view === "grid"
              ? <ProductCard key={p.id} product={p} />
              : <ProductListCard key={p.id} product={p} />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn("shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all active:scale-95",
        active ? "bg-primary text-primary-foreground" : "border bg-card hover:border-primary/40 hover:text-primary")}>
      {children}
    </button>
  );
}

function ProductListCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`;
  const isFree = product.price === 0 || product.pricingType === "free";
  const isComingSoon = product.status === "coming_soon";

  return (
    <div className="flex gap-4 rounded-xl border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.title} className="size-full object-cover" />
        ) : (
          <div className={cn("size-full bg-gradient-to-br", product.gradient ?? "from-violet-600 to-fuchsia-700")} />
        )}
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white">Soon</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.categoryLabel}</span>
        <a href={href} className="line-clamp-1 font-semibold hover:text-primary">{product.title}</a>
        <p className="line-clamp-1 text-xs text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className={cn("text-sm font-bold", isFree && "text-emerald-600 dark:text-emerald-400")}>
            {isComingSoon ? "Coming Soon" : isFree ? "FREE" : `₹${product.price}`}
          </span>
          {!isComingSoon && (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              {isFree ? "Get Free" : "Buy Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
