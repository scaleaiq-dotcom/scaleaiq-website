import Link from "next/link";
import Image from "next/image";
import { Gift, ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";

export function FreeWeekBanner({ products }: { products: Product[] }) {
  const hero = products[0];
  if (!hero) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-background p-5 sm:p-7 dark:from-emerald-950/80">
        {/* Glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Thumbnail */}
          {hero.thumbnailUrl && (
            <Link href={`/product/${hero.slug}`} className="shrink-0">
              <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-emerald-500/30 sm:h-32 sm:w-52">
                <Image
                  src={hero.thumbnailUrl}
                  alt={hero.title}
                  fill
                  sizes="208px"
                  className="object-cover"
                />
              </div>
            </Link>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                <Gift className="size-3" /> Free This Week
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-500">
                Limited time
              </span>
            </div>
            <h2 className="line-clamp-2 text-base font-bold text-foreground sm:text-lg">
              {hero.title}
            </h2>
            {hero.shortDescription && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {hero.shortDescription}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/product/${hero.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Get it Free <ArrowRight className="size-3.5" />
              </Link>
              {products.length > 1 && (
                <Link
                  href="/explore?price=free"
                  className="text-xs font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  +{products.length - 1} more free resources →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
