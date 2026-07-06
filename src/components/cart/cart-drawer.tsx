"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total, count } = useCart();
  const cartTotal = total();
  const cartCount = count();
  const hasFreeOnly = items.every(i => i.pricingType === "free");

  // Close on Escape
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closeCart(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Lock body scroll when open
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            <h2 className="font-heading text-lg font-bold">Your Cart</h2>
            {cartCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-2xl bg-muted p-6">
                <ShoppingBag className="size-10 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-heading font-semibold">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Browse products and add them here</p>
              </div>
              <Link href="/explore" onClick={closeCart} className={buttonVariants()}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 rounded-xl border bg-background p-3">
                  {/* Thumbnail */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                    {item.thumbnailUrl ? (
                      <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className={cn("size-full", item.gradient ?? "bg-gradient-to-br from-violet-500 to-cyan-400")} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      {item.pricingType === "free" ? (
                        <span className="text-sm font-bold text-emerald-500">FREE</span>
                      ) : (
                        <span className="text-sm font-bold">₹{item.price}</span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            {/* Total */}
            <div className="rounded-xl bg-muted/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-heading text-xl font-extrabold">
                  {hasFreeOnly ? "FREE" : `₹${cartTotal}`}
                </span>
              </div>
              {!hasFreeOnly && (
                <p className="mt-1 text-xs text-muted-foreground">Have a coupon? Apply it at checkout.</p>
              )}
            </div>

            {/* Checkout */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hasFreeOnly ? "Get Free Items" : "Proceed to Checkout"}
              <ArrowRight className="size-4" />
            </Link>

            <p className="text-center text-xs text-muted-foreground">
              Secure checkout · Instant delivery after payment
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
