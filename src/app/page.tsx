import { Hero } from "@/components/home/hero";
import { ProductGrid } from "@/components/home/product-grid";
import { CategorySection } from "@/components/home/category-section";
import { WhyScaleAIQ } from "@/components/home/why-scaleaiq";
import { Testimonials } from "@/components/home/testimonials";
import { ReviewForm } from "@/components/home/review-form";
import { Newsletter } from "@/components/home/newsletter";
import { adminDb } from "@/lib/firebase/admin";
import {
  getFeaturedProducts,
  getTrendingProducts,
  getFreeThisWeekProducts,
  getBestSellerProducts,
  getRecentProducts,
  getProductsByCategory,
} from "@/lib/firebase/products";

export const dynamic = "force-dynamic"; // never cache — admin changes reflect instantly

export default async function Home() {
  const [featured, trending, freeThisWeek, topSellers, recent, prompts, reviewsSnap] = await Promise.all([
    getFeaturedProducts(8).catch(() => []),
    getTrendingProducts(8).catch(() => []),
    getFreeThisWeekProducts(8).catch(() => []),
    getBestSellerProducts(8).catch(() => []),
    getRecentProducts(8).catch(() => []),
    getProductsByCategory("prompts", 8).catch(() => []),
    adminDb.collection("siteReviews").where("approved", "==", true).orderBy("createdAt", "desc").limit(6).get().catch(() => null),
  ]);
  const reviews = reviewsSnap?.docs.map(d => ({ id: d.id, name: d.data().name as string, rating: d.data().rating as number, comment: d.data().comment as string })) ?? [];

  return (
    <>
      <Hero />

      <ProductGrid
        title="Featured Products"
        products={featured}
        viewAllHref="/explore"
      />

      <CategorySection />

      <ProductGrid
        title="Trending"
        products={trending}
        viewAllHref="/explore?sort=trending"
      />

      <ProductGrid
        title="Free This Week"
        products={freeThisWeek}
        viewAllHref="/explore?price=free"
      />

      <ProductGrid
        title="Best Sellers"
        products={topSellers}
        viewAllHref="/explore?sort=best-sellers"
        ranked
      />

      <ProductGrid
        title="Recently Added"
        products={recent}
        viewAllHref="/explore?sort=newest"
      />

      <ProductGrid
        title="Prompt Library"
        products={prompts}
        viewAllHref="/category/prompts"
      />

      <WhyScaleAIQ />

      <Testimonials reviews={reviews} />

      {/* Review submission */}
      <section className="container mx-auto px-4 pb-10">
        <div className="mx-auto max-w-lg">
          <ReviewForm />
        </div>
      </section>

      <Newsletter />
    </>
  );
}
