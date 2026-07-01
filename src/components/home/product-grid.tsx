import type { Product } from "@/types/product";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/home/section-header";

export function ProductGrid({
  title,
  products,
  viewAllHref,
  ranked = false,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
  /** Show 1..n rank badges (Best Sellers). */
  ranked?: boolean;
}) {
  // Don't render the section at all if there are no products
  if (!products || products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6">
      <SectionHeader title={title} viewAllHref={viewAllHref} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            rank={ranked ? i + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
