import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Clock, Bot, BookOpen, LayoutTemplate, MessageSquareText, TrendingUp, Briefcase, Zap, Gift, Palette, Play, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/common/rating-stars";

export function ProductCard({
  product,
  rank,
}: {
  product: Product;
  rank?: number;
}) {
  const href = `/product/${product.slug}`;
  const isFree = product.price === 0 || product.pricingType === "free";
  const isComingSoon =
    product.status === "coming_soon" || product.pricingType === "coming_soon";
  // Any free preview content → show a "Try Free" chip that deep-links to the
  // Try Before You Buy section (#try) on the product page.
  const hasTry = !isComingSoon && !!(
    (product.pvEnabled && product.pvVideos?.length) ||
    (product.pdfEnabled && product.pdfFiles?.length) ||
    (product.sampleEnabled && product.sampleFiles?.length) ||
    (product.demoEnabled && product.demoUrl) ||
    (product.extDemoEnabled && product.extDemoUrl) ||
    (product.epubEnabled && product.previewEpubUrl) ||
    (product.galleryEnabled && product.galleryImages?.length)
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Cover */}
      <div className="relative">
      <Link href={href} className="relative block aspect-video overflow-hidden">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              "flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br",
              product.gradient ?? "from-violet-600 to-fuchsia-700"
            )}
          >
            <CategoryIcon category={product.category} className="size-10 text-white/80" />
            <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-widest text-white/60">
              {product.categoryLabel}
            </span>
          </div>
        )}

        {/* Badges */}
        {isComingSoon ? (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
            <Clock className="size-3 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              Coming Soon
            </span>
          </span>
        ) : (
          <>
            {isFree && !rank && (
              <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                Free
              </span>
            )}
            {rank !== undefined && (
              <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-md bg-brand-gradient text-xs font-bold text-white shadow">
                {rank}
              </span>
            )}
            {product.bestSeller && !rank && (
              <span className="absolute right-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                Best Seller
              </span>
            )}
          </>
        )}
      </Link>
      {/* Try Free chip — deep-links to the Try Before You Buy section */}
      {hasTry && (
        <Link href={`${href}#try`}
          className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm transition-colors hover:bg-primary">
          <Play className="size-3 fill-emerald-400 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-white">Try Free</span>
        </Link>
      )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {product.categoryLabel}
        </span>
        <Link
          href={href}
          className="line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:text-primary"
        >
          {product.title}
        </Link>
        {!isComingSoon && (
          <RatingStars rating={product.rating} count={product.ratingCount} />
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {isComingSoon ? (
            <span className="text-xs font-medium text-muted-foreground">
              Notify me
            </span>
          ) : isFree ? (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              FREE
            </span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          )}
          <Button
            size="icon-sm"
            variant="outline"
            aria-label={`Add ${product.title} to cart`}
            disabled={isComingSoon}
            className="rounded-lg text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
          >
            <ShoppingCart className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const categoryIconMap: Record<string, LucideIcon> = {
  "ai-tools": Bot,
  courses: BookOpen,
  templates: LayoutTemplate,
  prompts: MessageSquareText,
  ebooks: BookOpen,
  finance: TrendingUp,
  business: Briefcase,
  automation: Zap,
  free: Gift,
  design: Palette,
};

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIconMap[category] ?? Bot;
  return <Icon className={className} strokeWidth={1.5} />;
}
