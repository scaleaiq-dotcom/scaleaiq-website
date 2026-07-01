"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  category?: string;
  addedAt: string | null;
}

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [removing, setRemoving] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) { setDataLoading(false); return; }
    loadItems();
  }, [user]);

  async function loadItems() {
    if (!user) return;
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");

    const snap = await getDocs(
      query(collection(db, "wishlists", user.uid, "items"), orderBy("addedAt", "desc"))
    ).catch(() => null);

    if (snap) {
      setItems(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          productId: data.productId ?? d.id,
          title: data.title ?? "Product",
          slug: data.slug ?? "",
          price: data.price ?? 0,
          originalPrice: data.originalPrice,
          thumbnail: data.thumbnail,
          category: data.category,
          addedAt: data.addedAt?.toDate?.()?.toLocaleDateString("en-IN") ?? null,
        };
      }));
    }
    setDataLoading(false);
  }

  async function removeItem(itemId: string) {
    if (!user) return;
    setRemoving(itemId);
    const { db } = await import("@/lib/firebase/client");
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "wishlists", user.uid, "items", itemId)).catch(() => null);
    setItems(prev => prev.filter(i => i.id !== itemId));
    setRemoving(null);
  }

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <Heart className="mx-auto size-12 text-muted-foreground/40" />
        <p className="mt-3 font-heading text-lg font-semibold">Your wishlist is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Save products you love by clicking the heart icon on any product</p>
        <Link href="/explore" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{items.length} saved product{items.length !== 1 ? "s" : ""}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <div key={item.id} className="group rounded-xl border bg-card overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingCart className="size-8 text-muted-foreground/30" />
                </div>
              )}
              {item.category && (
                <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                  {item.category}
                </span>
              )}
            </div>
            <div className="p-4">
              <Link href={`/product/${item.slug}`} className="font-medium leading-tight hover:text-primary line-clamp-2">
                {item.title}
              </Link>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-primary">₹{item.price}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice}</span>
                  )}
                </div>
                <button onClick={() => removeItem(item.id)} disabled={removing === item.id}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-500 disabled:opacity-50">
                  {removing === item.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </button>
              </div>
              <Link href={`/product/${item.slug}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <ShoppingCart className="size-4" /> View Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
