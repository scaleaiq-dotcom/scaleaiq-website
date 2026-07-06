"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download, Star, ShoppingCart, Heart, Share2, Clock,
  CheckCircle2, User, Tag, Layers, FileText, Play,
  MessageSquare, Copy, Check, Bell, Package, ExternalLink, Send, Loader2, X,
  FileArchive, FileSpreadsheet, FileCode2, Music, Film, ImageIcon, Link2,
  BookOpen, Globe, Mail, Video, Lock, ListChecks, Users2, Sparkles,
} from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/home/product-card";
import { RatingStars } from "@/components/common/rating-stars";
import { useCart } from "@/store/cart";
import { useAuth, notifyAuthChanged } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { EbookReader } from "@/components/ebook/ebook-reader";

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",     label: "Overview" },
  { id: "description",  label: "Description" },
  { id: "screenshots",  label: "Screenshots" },
  { id: "video",        label: "Video" },
  { id: "share",        label: "Share" },
  { id: "reviews",      label: "Reviews" },
] as const;

type TabId = typeof TABS[number]["id"];

interface Props { product: Product; related: Product[] }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ProductDetail({ product, related }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabId>("overview");
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [claimOpen, setClaimOpen] = React.useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const isFree = product.price === 0 || product.pricingType === "free";
  const isComingSoon = product.status === "coming_soon" || product.pricingType === "coming_soon";
  const allImages = [
    ...(product.thumbnailUrl ? [product.thumbnailUrl] : []),
    ...product.images,
  ];

  // Already purchased? The page itself is cached and identical for everyone,
  // so ownership is checked per-user and the Buy buttons swap to "You own this".
  const [owned, setOwned] = React.useState(false);
  React.useEffect(() => {
    if (!user || isFree) { setOwned(false); return; }
    let cancelled = false;
    fetch(`/api/owns?productId=${product.id}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setOwned(!!d.owned); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, product.id, isFree]);

  function requireAuth(action: () => void) {
    if (!user) {
      router.push(`/sign-in?redirect=/product/${product.slug}`);
      return;
    }
    action();
  }

  function handleAddToCart() {
    requireAuth(() => addItem({
      id: product.id, slug: product.slug, title: product.title,
      price: product.price, pricingType: product.pricingType,
      thumbnailUrl: product.thumbnailUrl, gradient: product.gradient,
      category: product.categoryLabel,
    }));
  }

  function handleGetFree() {
    // The claim dialog handles both modes: open (guest, details optional)
    // and protected (Google sign-in required, right inside the dialog).
    setClaimOpen(true);
  }

  function handleBuyNow() {
    requireAuth(() => {
      addItem({
        id: product.id, slug: product.slug, title: product.title,
        price: product.price, pricingType: product.pricingType,
        thumbnailUrl: product.thumbnailUrl, gradient: product.gradient,
        category: product.categoryLabel,
      });
      router.push("/checkout");
    });
  }

  function handleWishlist() {
    requireAuth(() => { /* TODO: Firestore wishlist */ });
  }

  const purchaseCardProps = { product, isFree, isComingSoon, owned, onAddToCart: handleAddToCart, onGetFree: handleGetFree, onBuyNow: handleBuyNow, onWishlist: handleWishlist };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="text-border">/</span>
          <Link href="/explore" className="hover:text-primary">Explore</Link>
          <span className="text-border">/</span>
          <Link href={`/category/${product.category}`} className="hover:text-primary">{product.categoryLabel}</Link>
          <span className="text-border">/</span>
          <span className="line-clamp-1 text-foreground">{product.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ═══ LEFT ═══ */}
          <div className="min-w-0 space-y-5">

            {/* Main image / hero */}
            <div className="relative overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-video">
                {allImages[selectedImage] ? (
                  <Image src={allImages[selectedImage]} alt={product.title} fill priority className="object-cover" />
                ) : (
                  <div className={cn("size-full", product.gradient ?? "bg-gradient-to-br from-violet-600 to-fuchsia-700")} />
                )}
                {isComingSoon && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                    <Clock className="size-10 text-white/80" />
                    <span className="text-xl font-bold uppercase tracking-widest text-white">Coming Soon</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative size-[72px] shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      i === selectedImage ? "border-primary shadow-md" : "border-transparent opacity-60 hover:border-muted-foreground/40 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt={`Screenshot ${i + 1}`} width={72} height={72} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Mobile purchase card */}
            <div className="lg:hidden">
              <PurchaseCard {...purchaseCardProps} />
            </div>

            {/* ─── TABS ─── */}
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-1 rounded-xl border bg-card p-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="rounded-2xl border bg-card p-6">
              {activeTab === "overview"    && <OverviewTab product={product} />}
              {activeTab === "description" && <DescriptionTab product={product} />}
              {activeTab === "screenshots" && <ScreenshotsTab images={allImages} />}
              {activeTab === "video"       && <VideoTab product={product} />}
              {activeTab === "share"       && <ShareTab product={product} />}
              {activeTab === "reviews"     && <ReviewsTab product={product} />}
            </div>

            {/* ─── RELATED PRODUCTS (always visible below tabs) ─── */}
            {related.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold">You May Also Like</h2>
                  <Link href={`/category/${product.category}`} className="text-sm font-medium text-primary hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {related.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}
          </div>

          {/* ═══ RIGHT — sticky sidebar ═══ */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <PurchaseCard {...purchaseCardProps} />
            </div>
          </div>

        </div>
      </div>

      {claimOpen && (
        <FreeClaimModal
          product={product}
          signedIn={!!user}
          freeTier={product.freeEnabled && !isFree}
          onClose={() => setClaimOpen(false)}
        />
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FREE CLAIM MODAL — the "free purchase" flow
// ─────────────────────────────────────────────────────────────────────────────
function FreeClaimModal({ product, signedIn, freeTier, onClose }: {
  product: Product; signedIn: boolean; freeTier?: boolean; onClose: () => void;
}) {
  const needsGoogle = product.access === "login_required" || product.access === "purchase_required";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<{
    files: { id: string; type: string; title: string; url: string }[];
    externalUrl?: string;
    alreadyClaimed: boolean;
  } | null>(null);

  async function claim(e?: React.FormEvent, skipDetails = false) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/free-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skipDetails
          ? { productId: product.id, freeTier: !!freeTier }
          : { productId: product.id, name, email, freeTier: !!freeTier }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(
          d.error === "signin_required" ? "Please sign in with Google to download this product."
          : d.error === "google_required" ? "This download requires a Google account. Please sign in with Google (your current account uses email/password)."
          : d.error ?? "Something went wrong."
        );
        return;
      }
      setResult({ files: d.files ?? [], externalUrl: d.externalUrl, alreadyClaimed: d.alreadyClaimed });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Google sign-in right inside the dialog (popup, with full-page redirect fallback)
  async function googleSignIn() {
    setError("");
    setBusy(true);
    try {
      const { signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      const provider = new GoogleAuthProvider();
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupErr: unknown) {
        const code = popupErr instanceof Error ? popupErr.message : "";
        if (code.includes("popup-blocked") || code.includes("cancelled-popup-request")) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
      const idToken = await result.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      notifyAuthChanged();
      await claim();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg.includes("popup-closed") ? "Sign-in was cancelled." : msg);
      setBusy(false);
    }
  }

  // Already-signed-in users on open products claim instantly on open.
  const autoClaimed = React.useRef(false);
  React.useEffect(() => {
    if (signedIn && !autoClaimed.current) {
      autoClaimed.current = true;
      claim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {!result ? (
          <>
            <h2 className="font-heading text-xl font-bold">{freeTier ? `Get Free Sample — "${product.title}"` : `Get "${product.title}" Free`}</h2>
            {signedIn ? (
              <>
                <div className="mt-6 flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  {busy && <><Loader2 className="size-5 animate-spin" /> Preparing your download…</>}
                </div>
                {error && (
                  <div className="space-y-3">
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
                    {error.includes("Google") && (
                      <Button className="w-full font-semibold" onClick={googleSignIn} disabled={busy}>
                        Sign in with Google
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : needsGoogle ? (
              /* PROTECTED FREE PRODUCT — Google sign-in only */
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  This free download is protected — sign in with your Google account to unlock it. One download per account.
                </p>
                {error && <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
                <Button className="mt-5 w-full gap-2 font-semibold" onClick={googleSignIn} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <>Sign in with Google &amp; Download</>}
                </Button>
                <button type="button" onClick={onClose} className="mt-2 w-full py-1 text-center text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </>
            ) : (
              /* OPEN FREE PRODUCT — details optional */
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your download is ready! Leave your name &amp; email to get updates on new free resources — or skip straight to the download.
                </p>
                <form onSubmit={claim} className="mt-5 space-y-3">
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)}
                  />
                  <input
                    type="email"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Your email (optional)" value={email} onChange={e => setEmail(e.target.value)}
                  />
                  {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
                  <Button type="submit" className="w-full font-semibold" disabled={busy}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <>Get Free Download <Download className="ml-1.5 size-4" /></>}
                  </Button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => claim(undefined, true)}
                    className="w-full py-1 text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Skip &amp; download without details
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-center py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </span>
              <h2 className="mt-3 font-heading text-xl font-bold">
                {result.alreadyClaimed ? "Welcome back!" : "It's yours! 🎉"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.alreadyClaimed
                  ? "You've claimed this before — here are your downloads again."
                  : "Your order is recorded. Download your files below."}
              </p>
            </div>

            <div className="mt-4 space-y-2.5">
              {result.files.map(f => (
                <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" download
                  className="group flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-3 transition-colors hover:border-primary hover:bg-primary/10">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Download className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{f.title}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{f.type} file</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-transform group-hover:scale-105 group-active:scale-95">
                    <Download className="size-3.5" /> Download
                  </span>
                </a>
              ))}
              {result.externalUrl && (
                <a href={result.externalUrl} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 p-3 transition-colors hover:border-primary hover:bg-primary/10">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ExternalLink className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">Open the app</span>
                    <span className="text-[11px] text-muted-foreground">Launches in a new tab</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-transform group-hover:scale-105 group-active:scale-95">
                    Open <ExternalLink className="size-3.5" />
                  </span>
                </a>
              )}
              {result.files.length === 0 && !result.externalUrl && (
                <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-center text-xs text-muted-foreground">
                  No files attached yet — the seller will add them soon.
                </p>
              )}
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {result.files.length > 0 ? "Tap Download to save each file to your device. " : ""}Shared your email? The links are in your inbox too.
            </p>
            <Button variant="outline" className="mt-4 w-full" onClick={onClose}>Done</Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE CARD
// ─────────────────────────────────────────────────────────────────────────────
function PurchaseCard({ product, isFree, isComingSoon, owned, onAddToCart, onGetFree, onBuyNow, onWishlist }: {
  product: Product; isFree: boolean; isComingSoon: boolean; owned: boolean;
  onAddToCart: () => void; onGetFree: () => void; onBuyNow: () => void; onWishlist: () => void;
}) {
  const { coupon: applied, setCoupon: setApplied } = useCart();
  const [couponInput, setCouponInput] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError("");
    setChecking(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: product.price }),
      });
      const d = await res.json();
      if (d.valid) {
        setApplied({ code: d.code, discount: d.discount });
        setCouponInput(d.code);
      } else {
        setApplied(null);
        setCouponError(d.error ?? "Invalid or expired coupon code.");
      }
    } catch {
      setCouponError("Could not verify coupon. Try again.");
    } finally {
      setChecking(false);
    }
  }

  function removeCoupon() {
    setApplied(null);
    setCouponInput("");
    setCouponError("");
  }

  const discountedPrice = applied ? Math.max(0, product.price - applied.discount) : product.price;

  const isExternal =
    !!product.externalUrl &&
    (product.deliveryType === "external" || product.launchType === "External URL");
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Category */}
      <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
        {product.categoryLabel}
      </span>

      {/* Title + description */}
      <h1 className="mt-2 font-heading text-xl font-extrabold leading-snug">{product.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.shortDescription}</p>

      {/* Rating + downloads */}
      <div className="mt-3 flex items-center gap-2">
        <RatingStars rating={product.rating} count={product.ratingCount} />
        <span className="text-xs text-muted-foreground">
          · {(product.downloadCount ?? 0).toLocaleString("en-IN")} downloads
        </span>
      </div>

      {/* Price + CTA */}
      <div className="mt-5 border-t pt-5">
        {isComingSoon ? (
          <p className="font-heading text-xl font-bold text-muted-foreground">Coming Soon</p>
        ) : isFree ? (
          <p className="font-heading text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">FREE</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>
        )}

        {/* Coupon input — paid products only, not owned/free/coming-soon */}
        {!isFree && !isComingSoon && !owned && (
          <div className="mt-4">
            {applied ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-500/10 px-3 py-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="size-4" /> {applied.code} — ₹{applied.discount} off
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
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                    placeholder="Have a coupon code?"
                    className="h-9 w-full rounded-lg border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={checking || !couponInput.trim()}
                  className="shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {checking ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2.5">
          {owned ? (
            /* Already purchased — no selling, just access */
            <>
              <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 px-4 py-3 font-heading font-bold text-emerald-600">
                <CheckCircle2 className="size-5" /> You own this product
              </div>
              <Link
                href="/dashboard/downloads"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-heading font-bold text-white transition-opacity hover:opacity-90"
              >
                <Download className="size-4" /> Open My Library
              </Link>
              {!!product.externalUrl && (
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 font-heading font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <ExternalLink className="size-4" /> Open App
                </a>
              )}
            </>
          ) : isComingSoon ? (
            <NotifyMeBox product={product} />
          ) : isFree ? (
            /* FREE — every launch type goes through the claim flow so the
               buyer gets downloads, the order is recorded, and it lands in
               their library. External apps get an extra Open App button. */
            <>
              <button
                onClick={onGetFree}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-heading font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <Download className="size-4" /> Get for Free
              </button>
              {isExternal && (
                <a
                  href={product.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 font-heading font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <ExternalLink className="size-4" /> Open App
                </a>
              )}
            </>
          ) : isExternal ? (
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-heading font-bold text-white transition-opacity hover:opacity-90"
            >
              <ExternalLink className="size-4" />
              {`Open App — ${formatPrice(product.price)}`}
            </a>
          ) : product.freeEnabled ? (
            /* Freemium — free limited tier + paid full access */
            <div className="space-y-2.5">
              {product.freeDescription && (
                <div className="rounded-xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-semibold text-foreground">Free tier includes:</p>
                  {product.freeDescription.split("\n").filter(Boolean).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
              <button
                onClick={onGetFree}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 px-4 py-3 font-heading font-bold text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white"
              >
                <Download className="size-4" />
                Get Free{product.freeLabel ? ` — ${product.freeLabel}` : " Version"}
              </button>
              <div className="relative flex items-center gap-2">
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t" />
              </div>
              <button
                onClick={onBuyNow}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-heading font-bold text-white transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="size-4" />
                {applied
                  ? <>Get Full Access — <span className="line-through opacity-60 mr-1">{formatPrice(product.price)}</span>{formatPrice(discountedPrice)}</>
                  : <>Get Full Access — {formatPrice(product.price)}</>}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 font-heading font-bold text-white transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="size-4" /> Add to Cart
              </button>
              <button
                onClick={onBuyNow}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 font-heading font-bold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {applied ? <>Buy Now — <span className="line-through opacity-60 mr-1">{formatPrice(product.price)}</span>{formatPrice(discountedPrice)}</> : <>Buy Now — {formatPrice(product.price)}</>}
              </button>
            </>
          )}
          {!owned && (
            <button
              onClick={onWishlist}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Heart className="size-4" /> Save to Wishlist
            </button>
          )}
        </div>

        {/* Trust guarantees */}
        {!isComingSoon && !owned && (
          <ul className="mt-4 space-y-2 border-t pt-4">
            {[
              { icon: CheckCircle2, text: "Instant access after payment" },
              { icon: CheckCircle2, text: "Secure UPI · Cards · Netbanking" },
              { icon: CheckCircle2, text: isFree ? "Free — no credit card needed" : "Lifetime access, re-download anytime" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-3.5 shrink-0 text-emerald-500" />
                {text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Creator */}
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
          {product.creatorAvatar ? (
            <Image src={product.creatorAvatar} alt={product.creatorName} width={36} height={36} className="size-full rounded-full object-cover" />
          ) : (
            <User className="size-4 text-white" />
          )}
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Created by</p>
          <p className="text-sm font-semibold">{product.creatorName}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ product }: { product: Product }) {
  const [reader, setReader] = React.useState<{ url: string; label: string } | null>(null);
  const [readerBusy, setReaderBusy] = React.useState(false);
  const [readerMsg, setReaderMsg] = React.useState("");
  const isFree = product.price === 0 || product.pricingType === "free";

  // Open the full book if the buyer owns it (or it's free); otherwise nudge to buy.
  async function openFullBook() {
    setReaderMsg("");
    setReaderBusy(true);
    try {
      // Access check only — the reader streams the bytes from the same-origin
      // proxy (/api/ebook-file), which avoids Firebase CORS and hides the URL.
      const res = await fetch(`/api/ebook-url?productId=${product.id}`);
      if (res.ok) {
        setReader({ url: `/api/ebook-file?productId=${product.id}&type=full`, label: "Full book" });
      } else if (res.status === 401) {
        setReaderMsg("Please sign in to read this book.");
      } else if (res.status === 403) {
        setReaderMsg("Purchase this book to read the full version.");
      } else {
        setReaderMsg("Could not open the book. Please try again.");
      }
    } catch {
      setReaderMsg("Could not open the book. Please try again.");
    } finally {
      setReaderBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 font-heading text-xl font-bold">About this product</h2>
        <p className="leading-relaxed text-muted-foreground">
          {product.shortDescription || product.description}
        </p>
      </div>

      <div className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-2">
        {[
          { icon: Layers,   label: "Category",  value: product.categoryLabel },
          { icon: FileText, label: "Type",       value: product.deliveryType?.replace(/_/g, " ") },
          { icon: User,     label: "Creator",    value: product.creatorName },
          { icon: Download, label: "Downloads",  value: (product.downloadCount ?? 0).toLocaleString("en-IN") },
          { icon: Star,     label: "Rating",     value: `${product.rating.toFixed(1)} (${product.ratingCount} reviews)` },
          ...(product.version ? [{ icon: Tag, label: "Version", value: product.version }] : []),
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <Icon className="size-4 shrink-0 text-primary/70" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium capitalize">{value}</span>
          </div>
        ))}
      </div>

      {/* eBook reader */}
      {product.epubEnabled && (product.previewEpubUrl || product.hasEpub) && (
        <div className="rounded-xl border bg-gradient-to-br from-emerald-500/5 to-primary/5 p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-emerald-600" />
            <p className="text-sm font-semibold">Read this ebook</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            A built-in reader with search, chapters, adjustable text, and night mode — no download needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.previewEpubUrl && (
              <button onClick={() => setReader({ url: `/api/ebook-file?productId=${product.id}&type=preview`, label: "Free sample" })}
                className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-semibold transition-colors hover:border-primary hover:text-primary">
                <BookOpen className="size-3.5" /> Read free sample
              </button>
            )}
            {product.hasEpub && (
              <button onClick={openFullBook} disabled={readerBusy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
                {readerBusy ? <Loader2 className="size-3.5 animate-spin" /> : <BookOpen className="size-3.5" />}
                {isFree ? "Read the book" : "Read the full book"}
              </button>
            )}
          </div>
          {readerMsg && <p className="mt-2 text-xs text-amber-600">{readerMsg}</p>}
        </div>
      )}

      {reader && (
        <EbookReader url={reader.url} title={product.title} label={reader.label} onClose={() => setReader(null)} />
      )}

      {/* Image bundle preview gallery (free to view) */}
      {product.galleryEnabled && (product.galleryImages?.length ?? 0) > 0 && (
        <ImageGallery images={product.galleryImages!} isFree={isFree} />
      )}

      {/* Experience feature buttons */}
      {(product.pvEnabled && product.pvVideos?.length) || (product.pdfEnabled && product.pdfFiles?.length) || (product.sampleEnabled && product.sampleFiles?.length) || (product.demoEnabled && product.demoUrl) || (product.extDemoEnabled && product.extDemoUrl) ? (
        <div className="space-y-2.5">
          <p className="text-sm font-semibold">Try Before You Buy</p>
          <div className="flex flex-wrap gap-2">
            {product.pvEnabled && (product.pvVideos ?? []).map(v => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                <Video className="size-3.5" /> {v.title ? `Preview Video — ${v.title}` : "Watch Preview Video"}
              </a>
            ))}
            {product.pdfEnabled && (product.pdfFiles ?? []).map(f => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                <FileText className="size-3.5" /> {f.title ? `PDF Preview — ${f.title}` : "Read PDF Preview"}{product.pdfPages ? ` (pages ${product.pdfPages})` : ""}
              </a>
            ))}
            {product.sampleEnabled && (product.sampleFiles ?? []).map(f => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                <Download className="size-3.5" /> {f.title ? `Free Sample — ${f.title}` : "Free Sample"}
              </a>
            ))}
            {product.demoEnabled && product.demoUrl && (
              <a href={product.demoUrl} target={product.demoMode === "tab" ? "_blank" : "_self"} rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                <Play className="size-3.5" /> Interactive Demo
              </a>
            )}
            {product.extDemoEnabled && product.extDemoUrl && (
              <a href={product.extDemoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                <ExternalLink className="size-3.5" /> Live Demo
              </a>
            )}
          </div>
        </div>
      ) : null}

      <WhatsIncluded product={product} />

      <TutorialsList product={product} />

      <ContentLists product={product} />

      <ResourceLinks product={product} />

      {product.tags?.length > 0 && (
        <div>
          <p className="mb-2.5 text-sm font-semibold">Tags</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span key={tag} className="rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── What's Included (bundle contents from Downloads tab) ────────────────────
const fileIconMap: Record<string, typeof FileText> = {
  PDF: FileText, ZIP: FileArchive, RAR: FileArchive,
  Excel: FileSpreadsheet, CSV: FileSpreadsheet,
  Code: FileCode2, Audio: Music, "Video File": Film,
  Image: ImageIcon, "Image Pack": ImageIcon,
  "Video URL": Video, "External Link": Link2, "Website Link": Globe,
  "Prompt Pack": MessageSquare, Workflow: Layers, Template: Layers,
  Checklist: ListChecks, Certificate: Star, Bonus: Sparkles,
};

// ─── Image bundle preview gallery (free to view; full set unlocks on purchase) ─
function ImageGallery({ images, isFree }: { images: string[]; isFree: boolean }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const show = (i: number) => setOpen(i);
  const close = () => setOpen(null);
  const move = (d: number) => setOpen(o => o === null ? o : (o + d + images.length) % images.length);

  React.useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, images.length]);

  return (
    <div className="rounded-xl border bg-gradient-to-br from-pink-500/5 to-primary/5 p-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-pink-500" />
        <p className="text-sm font-semibold">Preview the image bundle</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {images.length} sample{images.length === 1 ? "" : "s"} — tap to enlarge. {isFree ? "Get the full-resolution set free below." : "The full-resolution pack unlocks after purchase."}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((src, i) => (
          <button key={i} onClick={() => show(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Preview ${i + 1}`} loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button onClick={close} aria-label="Close" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20">×</button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); move(-1); }} aria-label="Previous" className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">‹</button>
              <button onClick={e => { e.stopPropagation(); move(1); }} aria-label="Next" className="absolute right-3 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">›</button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[open]} alt={`Preview ${open + 1}`} onClick={e => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain" />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">{open + 1} / {images.length}</span>
        </div>
      )}
    </div>
  );
}

function WhatsIncluded({ product }: { product: Product }) {
  const files = product.downloads ?? [];
  if (files.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-heading text-lg font-bold">What&apos;s Included</h3>
      <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
        {files.map(f => {
          const Icon = fileIconMap[f.type] ?? FileText;
          return (
            <div key={f.id} className="flex items-start gap-3 rounded-lg bg-card p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{f.title || f.type}</p>
                {f.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>}
              </div>
              <span className="shrink-0 rounded-md border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                {f.type}
              </span>
            </div>
          );
        })}
        <p className="flex items-center gap-1.5 px-1 pt-1 text-xs text-muted-foreground">
          <Lock className="size-3" /> Files unlock instantly after purchase{product.pricingType === "free" ? " (free)" : ""}.
        </p>
      </div>
    </div>
  );
}

// ─── Tutorials (from Tutorials tab; free previews playable) ──────────────────
function TutorialsList({ product }: { product: Product }) {
  const tuts = product.tutorials ?? [];
  if (tuts.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-heading text-lg font-bold">Tutorials &amp; Lessons</h3>
      <div className="space-y-2">
        {tuts.map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{t.title}</p>
              {t.duration && <p className="mt-0.5 text-xs text-muted-foreground">{t.duration}</p>}
            </div>
            {t.free && t.videoUrl ? (
              <a href={t.videoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/40 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                <Play className="size-3" /> Preview
              </a>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Lock className="size-3" /> Locked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Content lists (Features / Benefits / Requirements / Audience) ───────────
function splitLines(v?: string): string[] {
  return (v ?? "").split("\n").map(s => s.trim()).filter(Boolean);
}

function ContentLists({ product }: { product: Product }) {
  const sections = [
    { title: "Key Features", items: splitLines(product.features), icon: CheckCircle2 },
    { title: "What You'll Gain", items: splitLines(product.benefits), icon: Sparkles },
    { title: "Requirements", items: splitLines(product.requirements), icon: ListChecks },
    { title: "Who Is This For", items: splitLines(product.audience), icon: Users2 },
  ].filter(s => s.items.length > 0);
  if (sections.length === 0) return null;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {sections.map(({ title, items, icon: Icon }) => (
        <div key={title} className="rounded-xl border bg-card p-4">
          <h3 className="mb-2.5 font-heading text-sm font-bold">{title}</h3>
          <ul className="space-y-1.5">
            {items.map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Resources (docs / website / community / support) ────────────────────────
function ResourceLinks({ product }: { product: Product }) {
  const links = [
    { url: product.docUrl, label: "Documentation", icon: BookOpen },
    { url: product.websiteUrl, label: "Official Website", icon: Globe },
    { url: product.communityUrl, label: "Community", icon: MessageSquare },
    { url: product.supportEmail ? `mailto:${product.supportEmail}` : "", label: "Support", icon: Mail },
  ].filter(l => l.url);
  if (links.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2.5 font-heading text-sm font-bold">Resources</h3>
      <div className="flex flex-wrap gap-2">
        {links.map(({ url, label, icon: Icon }) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
            <Icon className="size-3.5" /> {label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIPTION TAB
// ─────────────────────────────────────────────────────────────────────────────
function DescriptionTab({ product }: { product: Product }) {
  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-bold">Full Description</h2>
      <div className="max-w-none leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {product.description || product.shortDescription || "No description provided."}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREENSHOTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function ScreenshotsTab({ images }: { images: string[] }) {
  if (!images.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Package className="size-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No screenshots available</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-bold">Screenshots</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-video overflow-hidden rounded-xl border">
            <Image src={img} alt={`Screenshot ${i + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO TAB
// ─────────────────────────────────────────────────────────────────────────────
function toEmbedUrl(url: string): string {
  if (!url) return "";
  // youtube.com/watch?v=ID → youtube.com/embed/ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // vimeo.com/ID → player.vimeo.com/video/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function VideoTab({ product }: { product: Product }) {
  const rawUrl = product.pvUrl || product.videoUrl || "";
  if (!rawUrl) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Play className="size-7 text-muted-foreground/40" />
        </div>
        <p className="font-medium">No video preview available</p>
        <p className="text-sm text-muted-foreground">The creator hasn&apos;t added a video for this product yet.</p>
      </div>
    );
  }
  const embedUrl = toEmbedUrl(rawUrl);
  const isIframe = embedUrl.includes("youtube.com/embed") || embedUrl.includes("player.vimeo.com");
  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-bold">Product Video</h2>
      <div className="overflow-hidden rounded-2xl border">
        {isIframe ? (
          <iframe
            src={embedUrl}
            className="aspect-video w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <video src={rawUrl} controls className="aspect-video w-full" poster={product.thumbnailUrl} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARE TAB — proper SVG brand icons
// ─────────────────────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor">
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.672 4.8 1.845 6.796L2 30l7.387-1.822A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Zm0 25.5a11.46 11.46 0 0 1-5.837-1.601l-.418-.248-4.383 1.082 1.104-4.277-.27-.435A11.46 11.46 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5Zm6.29-8.394c-.344-.172-2.036-1.004-2.352-1.118-.316-.115-.547-.172-.777.172-.23.344-.892 1.118-1.094 1.348-.201.23-.403.258-.747.086-.344-.172-1.452-.535-2.766-1.707-1.022-.912-1.712-2.038-1.913-2.382-.201-.344-.021-.53.151-.702.155-.155.344-.403.516-.604.172-.201.23-.344.344-.574.115-.23.057-.43-.029-.603-.086-.172-.777-1.873-1.065-2.564-.28-.674-.565-.582-.777-.593l-.661-.011c-.23 0-.603.086-.92.43-.316.344-1.207 1.18-1.207 2.876 0 1.696 1.235 3.335 1.408 3.565.172.23 2.43 3.71 5.888 5.203.823.355 1.465.568 1.965.727.826.263 1.578.226 2.172.137.662-.099 2.036-.832 2.323-1.634.287-.803.287-1.49.201-1.634-.086-.144-.316-.23-.66-.401Z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor">
      <path d="M18.244 13.58 26.4 4h-1.94l-7.1 8.255L11.54 4H4l8.556 12.452L4 28h1.94l7.482-8.697L19.46 28H27L18.244 13.58Zm-2.65 3.08-.867-1.24L6.64 5.46h2.97l5.567 7.958.867 1.24 7.24 10.347h-2.97l-5.9-8.344Z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor">
      <path d="M29 16.028C29 9.405 23.627 4 17 4S5 9.405 5 16.028c0 6.002 4.388 10.977 10.125 11.874V19.54h-3.047v-3.512h3.047v-2.677c0-3.014 1.791-4.678 4.532-4.678 1.313 0 2.686.235 2.686.235v2.957h-1.513c-1.491 0-1.956.929-1.956 1.882v2.281h3.328l-.532 3.512h-2.796v8.362C24.612 27.005 29 22.03 29 16.028Z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor">
      <path d="M26.2 4H5.8C4.8 4 4 4.8 4 5.8v20.4c0 1 .8 1.8 1.8 1.8h20.4c1 0 1.8-.8 1.8-1.8V5.8C28 4.8 27.2 4 26.2 4ZM11.3 24.4H7.7V13h3.6v11.4ZM9.5 11.5c-1.2 0-2.1-.9-2.1-2.1s.9-2.1 2.1-2.1 2.1.9 2.1 2.1-.9 2.1-2.1 2.1Zm14.9 12.9H20.8V18.9c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.6h-3.6V13h3.5v1.6h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2Z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2Zm6.9 9.556-2.358 11.118c-.178.793-.644.986-1.304.613l-3.6-2.651-1.737 1.674c-.192.192-.353.353-.723.353l.258-3.66 6.657-6.014c.29-.258-.062-.4-.45-.143l-8.228 5.18-3.543-1.107c-.77-.242-.785-.77.16-1.14l13.839-5.337c.642-.232 1.203.143.985 1.114Z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor">
      <path d="M16 4c-3.26 0-3.668.013-4.948.072-1.277.059-2.148.261-2.911.558a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 4.63 8.14c-.297.763-.499 1.634-.558 2.911C4.013 12.332 4 12.74 4 16s.013 3.668.072 4.948c.059 1.277.261 2.148.558 2.911a5.88 5.88 0 0 0 1.384 2.126 5.88 5.88 0 0 0 2.127 1.385c.763.297 1.634.499 2.911.558C12.332 27.987 12.74 28 16 28s3.668-.013 4.948-.072c1.277-.059 2.148-.261 2.911-.558a5.88 5.88 0 0 0 2.126-1.385 5.88 5.88 0 0 0 1.385-2.126c.297-.763.499-1.634.558-2.911C27.987 19.668 28 19.26 28 16s-.013-3.668-.072-4.948c-.059-1.277-.261-2.148-.558-2.911a5.88 5.88 0 0 0-1.385-2.127 5.88 5.88 0 0 0-2.126-1.384c-.763-.297-1.634-.499-2.911-.558C19.668 4.013 19.26 4 16 4Zm0 2.162c3.204 0 3.584.012 4.85.07 1.17.053 1.805.249 2.228.413.56.218.96.478 1.38.898.42.42.68.82.898 1.38.164.423.36 1.058.413 2.228.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.053 1.17-.249 1.805-.413 2.228a3.72 3.72 0 0 1-.898 1.38 3.72 3.72 0 0 1-1.38.898c-.423.164-1.058.36-2.228.413-1.267.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.053-1.805-.249-2.228-.413a3.72 3.72 0 0 1-1.38-.898 3.72 3.72 0 0 1-.898-1.38c-.164-.423-.36-1.058-.413-2.228-.058-1.267-.07-1.646-.07-4.85s.012-3.584.07-4.85c.053-1.17.249-1.805.413-2.228.218-.56.478-.96.898-1.38.42-.42.82-.68 1.38-.898.423-.164 1.058-.36 2.228-.413 1.266-.058 1.646-.07 4.85-.07ZM16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 9.892a3.892 3.892 0 1 1 0-7.784 3.892 3.892 0 0 1 0 7.784ZM22.406 8.598a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z"/>
    </svg>
  );
}

const SHARE_PLATFORMS = [
  {
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    bg: "bg-[#25D366]",
    href: (url: string, title: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " — " + url)}`,
  },
  {
    label: "X (Twitter)",
    Icon: XIcon,
    bg: "bg-[#000000]",
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    Icon: FacebookIcon,
    bg: "bg-[#1877F2]",
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    Icon: LinkedInIcon,
    bg: "bg-[#0A66C2]",
    href: (url: string, title: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    label: "Telegram",
    Icon: TelegramIcon,
    bg: "bg-[#229ED9]",
    href: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: "Instagram",
    Icon: InstagramIcon,
    bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
    href: () => "https://www.instagram.com",
  },
] as const;

function ShareTab({ product }: { product: Product }) {
  const [copied, setCopied] = React.useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/product/${product.slug}`
    : `https://www.scaleaiq.in/product/${product.slug}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Share2 className="size-5 text-primary" />
        <h2 className="font-heading text-xl font-bold">Share this Product</h2>
      </div>

      {/* Copy link */}
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Product link</p>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-xl border bg-muted/30 px-3 py-2.5">
            <span className="flex-1 truncate text-sm text-muted-foreground">{url}</span>
          </div>
          <button
            onClick={copy}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              copied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20"
                : "hover:bg-accent"
            )}
          >
            {copied
              ? <><Check className="size-4" /> Copied!</>
              : <><Copy className="size-4" /> Copy</>}
          </button>
        </div>
      </div>

      {/* Social buttons */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Share on social</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SHARE_PLATFORMS.map(({ label, Icon, bg, href }) => (
            <a
              key={label}
              href={href(url, product.title)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl p-3.5 text-white transition-all hover:scale-105 hover:shadow-lg",
                bg
              )}
            >
              <Icon />
              <span className="text-[11px] font-semibold leading-none">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS TAB
// ─────────────────────────────────────────────────────────────────────────────
interface ReviewItem { id: string; name: string; avatar: string; rating: number; comment: string; helpful: number; verified: boolean; createdAt: string | null; }

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function ReviewsTab({ product }: { product: Product }) {
  const [reviews, setReviews] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/reviews/product?productId=${product.id}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [product.id]);

  const bars = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: n === 5 ? Math.floor(product.ratingCount * 0.65) :
           n === 4 ? Math.floor(product.ratingCount * 0.20) :
           n === 3 ? Math.floor(product.ratingCount * 0.10) :
                     Math.floor(product.ratingCount * 0.025),
  }));

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="flex items-start gap-6 rounded-2xl bg-muted/40 p-5">
        <div className="text-center">
          <p className="font-heading text-5xl font-extrabold leading-none">{product.rating.toFixed(1)}</p>
          <div className="mt-2 flex justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("size-4", i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{product.ratingCount} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {bars.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-right text-muted-foreground">{star}</span>
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: product.ratingCount ? `${(count / product.ratingCount) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-5 text-right text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                    {review.avatar || review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("size-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">· {timeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {review.verified && (
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <MessageSquare className="mx-auto size-10 text-muted-foreground/30" />
          <p className="mt-3 font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to review this product after purchasing.</p>
        </div>
      )}

      {/* Review form */}
      <GuestReviewForm product={product} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFY ME BOX — shown on coming soon products instead of buy buttons
// ─────────────────────────────────────────────────────────────────────────────
function NotifyMeBox({ product }: { product: Product }) {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId: product.id, productTitle: product.title }),
      });
      if (res.ok) setSent(true);
      else setError("Something went wrong. Try WhatsApp instead.");
    } catch {
      setError("Network error. Try WhatsApp instead.");
    } finally {
      setBusy(false);
    }
  }

  const waText = encodeURIComponent(`Hi! I want to be notified when "${product.title}" launches on ScaleAIQ. Please add me to the list.`);
  const waUrl = `https://wa.me/917990368493?text=${waText}`;

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-5 text-center dark:bg-emerald-900/20">
        <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
        <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-400">You&apos;re on the list!</p>
        <p className="mt-1 text-xs text-muted-foreground">We&apos;ll email you the moment this launches.</p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-[#25D366] px-4 py-2.5 text-sm font-bold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white">
          <MessageSquare className="size-4" /> Also notify me on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 px-4 py-5">
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-primary" />
        <p className="text-sm font-semibold">This product is coming soon</p>
      </div>
      <p className="text-xs text-muted-foreground">Get notified the moment it launches — by email or WhatsApp.</p>

      {/* Email notify */}
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          placeholder="Your email address"
          required
          className="h-9 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button type="submit" disabled={busy || !email.trim()}
          className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Notify Me"}
        </button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t" />
      </div>

      {/* WhatsApp */}
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#25D366] px-4 py-3 font-heading font-bold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white">
        <MessageSquare className="size-4" /> Notify Me on WhatsApp
      </a>
    </div>
  );
}

function GuestReviewForm({ product }: { product: Product }) {
  const isFree = product.price === 0 || product.pricingType === "free";
  const [form, setForm] = React.useState({ name: "", rating: 5, comment: "" });
  const [hoveredStar, setHoveredStar] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  if (!isFree) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold">✍️ Write a Review</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Only verified buyers can submit reviews. Purchase this product to unlock the review form.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-emerald-50 p-8 text-center dark:bg-emerald-900/10">
        <CheckCircle2 className="size-10 text-emerald-500" />
        <p className="font-semibold">Thank you for your review!</p>
        <p className="text-sm text-muted-foreground">It will appear here after our team approves it.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, productTitle: product.title, ...form }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 space-y-4">
      <h3 className="font-heading text-base font-bold">✍️ Write a Review</h3>
      <p className="text-xs text-muted-foreground -mt-2">Share your experience with this free product.</p>

      {/* Stars */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} type="button"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setForm(p => ({ ...p, rating: star }))}
            >
              <Star className={`size-7 transition-colors ${star <= (hoveredStar || form.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Name <span className="text-rose-500">*</span></label>
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="e.g. Rahul S."
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Review <span className="text-rose-500">*</span></label>
        <textarea rows={3} value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
          placeholder="What did you think of this product?"
          className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <button type="submit" disabled={loading || !form.name.trim() || !form.comment.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
