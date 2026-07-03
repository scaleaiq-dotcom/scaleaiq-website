"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Lock, ArrowLeft, Trash2, Tag,
  CheckCircle2, Zap, Download, RefreshCw, Headphones,
  ChevronRight, Loader2, X,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";

/* ─── Payment method logos as inline SVG icons ──────────────────────────── */
function UPIIcon() {
  return (
    <svg viewBox="0 0 48 20" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="20" rx="3" fill="#6C3EBD" />
      <text x="4" y="14" fontFamily="sans-serif" fontWeight="bold" fontSize="9" fill="white">UPI</text>
    </svg>
  );
}
function VisaIcon() {
  return (
    <svg viewBox="0 0 48 20" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="20" rx="3" fill="#1A1F71" />
      <text x="7" y="14" fontFamily="sans-serif" fontWeight="bold" fontSize="11" fill="white" letterSpacing="0.5">VISA</text>
    </svg>
  );
}
function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 20" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="20" rx="3" fill="#252525" />
      <circle cx="18" cy="10" r="7" fill="#EB001B" />
      <circle cx="30" cy="10" r="7" fill="#F79E1B" />
      <path d="M24 5.2a7 7 0 0 1 0 9.6A7 7 0 0 1 24 5.2Z" fill="#FF5F00" />
    </svg>
  );
}
function RazorpayIcon() {
  return (
    <svg viewBox="0 0 48 20" className="h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="20" rx="3" fill="#072654" />
      <text x="4" y="14" fontFamily="sans-serif" fontWeight="bold" fontSize="7" fill="#3395FF">Razorpay</text>
    </svg>
  );
}

/* ─── Trust badges ───────────────────────────────────────────────────────── */
const trustItems = [
  { icon: ShieldCheck, label: "256-bit SSL secured" },
  { icon: Zap,         label: "Instant delivery" },
  { icon: Download,    label: "Lifetime access" },
  { icon: RefreshCw,   label: "7-day refund policy" },
  { icon: Headphones,  label: "Priority support" },
];

/* ─── Main component ─────────────────────────────────────────────────────── */
export function CheckoutClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, removeItem, clearCart } = useCart();

  const [coupon, setCoupon] = React.useState("");
  const [couponApplied, setCouponApplied] = React.useState(false);
  const [couponError, setCouponError] = React.useState("");
  const [couponChecking, setCouponChecking] = React.useState(false);
  const [discount, setDiscount] = React.useState(0);
  const [billingName, setBillingName] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");
  const [placing, setPlacing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [orderId, setOrderId] = React.useState("");

  // Pre-fill from auth
  React.useEffect(() => {
    if (user) {
      setBillingName(user.displayName ?? "");
      setBillingEmail(user.email ?? "");
    }
  }, [user]);

  // Redirect guests to sign in
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  // Redirect to explore if cart is empty (and not in done state)
  React.useEffect(() => {
    if (!authLoading && items.length === 0 && !done) {
      router.push("/explore");
    }
  }, [authLoading, items.length, done, router]);

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const total = Math.max(0, subtotal - discount);
  const allFree = total === 0 && items.length > 0;

  /* ── Apply coupon — validated against the admin's real coupons ── */
  async function handleApplyCoupon() {
    setCouponError("");
    if (!coupon.trim()) return;
    setCouponChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setCouponApplied(true);
        setCoupon(data.code);
      } else {
        setCouponError(data.error ?? "Invalid or expired coupon code.");
      }
    } catch {
      setCouponError("Could not check that coupon. Please try again.");
    } finally {
      setCouponChecking(false);
    }
  }

  function removeCoupon() {
    setCoupon("");
    setCouponApplied(false);
    setDiscount(0);
    setCouponError("");
  }

  /* ── Place order ── */
  async function handlePlaceOrder() {
    if (!billingName.trim() || !billingEmail.trim()) return;
    setPlacing(true);
    try {
      if (allFree) {
        // Free items: create order directly without payment
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items, couponCode: couponApplied ? coupon : null,
            total: 0, billingName, billingEmail,
          }),
        });
        if (!res.ok) throw new Error("Order failed");
        const data = await res.json();
        setOrderId(data.orderId);
        clearCart();
        setDone(true);
        return;
      }

      // Paid items: create Razorpay order first. The server recomputes the
      // amount from real product prices + coupon, so we send item IDs, not a total.
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, couponCode: couponApplied ? coupon : null }),
      });
      if (!orderRes.ok) throw new Error("Failed to create payment");
      const { orderId: rzpOrderId, amount: rzpAmount } = await orderRes.json();

      // Load Razorpay checkout script
      await loadRazorpayScript();

      // Open Razorpay modal
      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzpAmount,
          currency: "INR",
          name: "ScaleAIQ",
          description: items.length === 1 ? items[0].title : `${items.length} products`,
          order_id: rzpOrderId,
          prefill: { name: billingName, email: billingEmail },
          theme: { color: "#7c3aed" },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items,
                  couponCode: couponApplied ? coupon : null,
                  total,
                  billingName,
                  billingEmail,
                }),
              });
              if (!verifyRes.ok) throw new Error("Verification failed");
              const data = await verifyRes.json();
              setOrderId(data.orderId);
              clearCart();
              setDone(true);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rzp.open();
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("cancelled")) {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setPlacing(false);
    }
  }

  function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) { resolve(); return; }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  /* ── Loading / redirect states ── */
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ── Order success screen ── */
  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold">
          {allFree ? "You're all set! 🎉" : "Order confirmed! 🎉"}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {allFree
            ? "Your free products have been added to your library instantly."
            : "Your payment was successful. Products are now in your library."}
        </p>
        {orderId && (
          <p className="mt-2 text-xs text-muted-foreground">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          📧 A receipt with your download links has been emailed to you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/downloads"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Go to My Library <ChevronRight className="size-4" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold transition-colors hover:bg-muted"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Minimal checkout header ── */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-emerald-500" />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* ── Back link ── */}
      <div className="container mx-auto px-4 pt-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
      </div>

      {/* ── Main grid ── */}
      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[1fr_400px]">

        {/* ═══ LEFT — Order summary ═══ */}
        <div className="space-y-4">
          <h1 className="font-heading text-2xl font-extrabold">Order Summary</h1>

          {/* Items */}
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                {/* Thumb */}
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  {item.thumbnailUrl ? (
                    <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className={cn("size-full", item.gradient ?? "bg-gradient-to-br from-violet-500 to-cyan-400")} />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 min-w-0 flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      {item.category}
                    </span>
                    <p className="mt-0.5 line-clamp-2 font-heading text-sm font-semibold leading-snug">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.pricingType === "free" || item.price === 0 ? (
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          FREE
                        </span>
                      ) : (
                        <span className="font-heading text-base font-extrabold">
                          {formatPrice(item.price)}
                        </span>
                      )}
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                        {item.pricingType === "one_time" ? "One-time" : item.pricingType}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="rounded-2xl border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Have a coupon?</p>
            {couponApplied ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span className="text-sm font-semibold">{coupon.toUpperCase()} applied — {formatPrice(discount)} off</span>
                </div>
                <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => { setCoupon(e.target.value); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <Button variant="outline" onClick={handleApplyCoupon} disabled={couponChecking || !coupon.trim()} className="shrink-0 rounded-xl">
                  {couponChecking ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}
            {couponError && (
              <p className="mt-2 text-xs text-destructive">{couponError}</p>
            )}
          </div>

          {/* Price breakdown */}
          <div className="rounded-2xl border bg-card p-4 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
              <span className="font-medium text-foreground">
                {subtotal === 0 ? "FREE" : formatPrice(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>Coupon discount</span>
                <span className="font-semibold">− {formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3">
              <span className="font-heading font-bold">Total</span>
              <span className="font-heading text-2xl font-extrabold text-primary">
                {allFree ? "FREE" : formatPrice(total)}
              </span>
            </div>
            {!allFree && (
              <p className="text-xs text-muted-foreground">
                Includes all applicable taxes. Prices are in Indian Rupees (₹).
              </p>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5">
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ RIGHT — Billing + payment ═══ */}
        <div className="space-y-4">
          {/* Billing info */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 font-heading text-base font-bold">Billing Details</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={billingName}
                  onChange={e => setBillingName(e.target.value)}
                  placeholder="Your full name"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={e => setBillingEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Download links will be sent to this email.
                </p>
              </div>
            </div>
          </div>

          {/* Payment method info */}
          {!allFree && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="mb-3 font-heading text-base font-bold">Payment</h2>
              <div className="flex flex-wrap gap-2">
                <UPIIcon />
                <VisaIcon />
                <MastercardIcon />
                <RazorpayIcon />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Powered by <span className="font-semibold text-foreground">Razorpay</span> — India&apos;s most trusted payment gateway. Supports UPI, credit/debit cards, net banking &amp; wallets.
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !billingName.trim() || !billingEmail.trim()}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl px-6 py-4 font-heading text-lg font-extrabold text-white transition-all",
              "bg-brand-gradient shadow-lg hover:shadow-xl hover:opacity-95 active:scale-[0.99]",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-5 animate-spin" />
                Processing…
              </span>
            ) : allFree ? (
              <span className="flex items-center justify-center gap-2">
                <Download className="size-5" />
                Get Free Access — Instant
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="size-5" />
                Pay {formatPrice(total)} Securely
              </span>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Your payment is encrypted and 100% secure.
          </p>

          {/* Trust badges — desktop sidebar */}
          <div className="hidden space-y-2 lg:block">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5">
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Legal */}
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            By placing this order you agree to ScaleAIQ&apos;s{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms of Use</Link>
            {" "}and{" "}
            <Link href="/refund" className="underline hover:text-foreground">Refund Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
