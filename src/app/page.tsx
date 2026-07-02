import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { ProductGrid } from "@/components/home/product-grid";
import { CategorySection } from "@/components/home/category-section";
import { WhyScaleAIQ } from "@/components/home/why-scaleaiq";
import { Testimonials } from "@/components/home/testimonials";
import { ReviewForm } from "@/components/home/review-form";
import { Newsletter } from "@/components/home/newsletter";
import { adminDb } from "@/lib/firebase/admin";
import { getHomeProducts, getCategories } from "@/lib/firebase/products";

// Revalidate every 60 seconds — admin changes show within 1 min, no cold-start on every visit
export const revalidate = 60;

const EMPTY_HOME = { featured: [], trending: [], freeThisWeek: [], topSellers: [], recent: [], prompts: [] };

export default async function Home() {
  const [home, categories, reviewsSnap] = await Promise.all([
    getHomeProducts(8).catch(() => EMPTY_HOME),
    getCategories().catch(() => []),
    adminDb.collection("siteReviews").where("approved", "==", true).orderBy("createdAt", "desc").limit(6).get().catch(() => null),
  ]);
  const { featured, trending, freeThisWeek, topSellers, recent, prompts } = home;

  const reviews = reviewsSnap?.docs.map(d => ({
    id: d.id,
    name: d.data().name as string,
    rating: d.data().rating as number,
    comment: d.data().comment as string,
  })) ?? [];

  return (
    <>
      <Hero />

      <ProductGrid title="Featured Products" products={featured} viewAllHref="/explore" />

      <CategorySection categories={categories} />

      <ProductGrid title="Trending" products={trending} viewAllHref="/explore?sort=trending" />

      <ProductGrid title="Free This Week" products={freeThisWeek} viewAllHref="/explore?price=free" />

      <ProductGrid title="Best Sellers" products={topSellers} viewAllHref="/explore?sort=best-sellers" ranked />

      <ProductGrid title="Recently Added" products={recent} viewAllHref="/explore?sort=newest" />

      <ProductGrid title="Prompt Library" products={prompts} viewAllHref="/category/prompts" />

      <TrustStrip />

      <WhyScaleAIQ />

      <Testimonials reviews={reviews} />

      <section className="container mx-auto px-4 pb-10">
        <div className="mx-auto max-w-lg">
          <ReviewForm />
        </div>
      </section>

      <Newsletter />
    </>
  );
}
