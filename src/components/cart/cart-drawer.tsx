"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Loader2, Check } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total, count } = useCart();
  const cartTotal = total();
  const cartCount = count();
  const hasFreeOnly = items.every(i => i.pricingType === "free");

  // Coupon — validated against the real coupons; the code is stashed in
  // sessionStorage so the checkout page picks it up automatically.
  const [coupon, setCoupon] = React.useState("");
  const [applied, setApplied] = React.useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  async function applyCoupon(codeArg?: string) {
    const code = (codeArg ?? coupon).trim();
    setCouponError("");
    if (!code) return;
    setChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cartTotal }),
      });
      const d = await res.json();
      if (d.valid) {
        setApplied({ code: d.code, discount: d.discount });
        setCoupon(d.code);
        try { sessionStorage.setItem("cart_coupon", d.code); } catch {}
      } else {
        setApplied(null);
        setCouponError(d.error ?? "Invalid or expired coupon code.");
      }
    } catch {
      setCouponError("Could not check that coupon. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCoupon("");
    setCouponError("");
    try { sessionStorage.removeItem("cart_coupon"); } catch {}
  }

  // Re-validate when the cart total changes (percent discounts depend on it)
  React.useEffect(() => {
    if (applied && cartTotal > 0) applyCoupon(applied.code);
    if (cartTotal === 0 && applied) removeCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  const discount = applied?.discount ?? 0;
  const payable = Math.max(0, cartTotal - discount);

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
            {/* Coupon (paid carts only) */}
            {!hasFreeOnly && (
              applied ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-500/10 px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Check className="size-4" /> {applied.code} — ₹{applied.discount} off
                  </span>
                  <button onClick={removeCoupon} aria-label="Remove coupon" className="text-muted-foreground hover:text-destructive">
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value); setCouponError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyCoupon()}
                      placeholder="Coupon code"
                      className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => applyCoupon()} disabled={checking || !coupon.trim()}>
                    {checking ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )
            )}
            {couponError && <p className="text-xs text-destructive">{couponError}</p>}

            {/* Total */}
            <div className="rounded-xl bg-muted/40 px-4 py-3">
              {discount > 0 && (
                <div className="mb-1 flex items-center justify-between text-sm text-emerald-600">
                  <span>Coupon discount</span>
                  <span className="font-semibold">− ₹{discount}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-heading text-xl font-extrabold">
                  {hasFreeOnly ? "FREE" : `₹${payable}`}
                </span>
              </div>
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
