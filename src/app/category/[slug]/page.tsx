import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, GraduationCap, LayoutTemplate, MessageSquareText, BookOpen, TrendingUp, Briefcase, Palette, Zap, Gift, type LucideIcon } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { getCategories, getProductsByCategory } from "@/lib/firebase/products";

export const dynamic = "force-dynamic";

const iconMap: Record<string, LucideIcon> = {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  BookOpen, TrendingUp, Briefcase, Palette, Zap, Gift,
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategories().catch(() => []);
  const cat = cats.find(c => c.slug === slug);
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat.name} — ScaleAIQ`,
    description: `Browse ${cat.name.toLowerCase()} on ScaleAIQ.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [cats, products] = await Promise.all([
    getCategories().catch(() => []),
    getProductsByCategory(slug, 48).catch(() => [] as Product[]),
  ]);

  const cat = cats.find(c => c.slug === slug);
  if (!cat) notFound();

  const Icon = iconMap[cat.icon] ?? Bot;
  const featured = products.filter(p => p.featured || p.bestSeller);
  const rest = products.filter(p => !p.featured && !p.bestSeller);

  return (
    <main className="min-h-screen">
      <div className="border-b bg-gradient-to-br from-background to-accent/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg">
              <Icon className="size-8" />
            </span>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link href="/explore" className="hover:text-primary">Explore</Link>
                <span>/</span>
                <span className="text-foreground">{cat.name}</span>
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{cat.name}</h1>
              <p className="mt-1 text-muted-foreground">{products.length} products · Updated regularly</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-10 px-4 py-8">
        {/* Other categories */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cats.filter(c => c.slug !== slug).map(c => {
            const CatIcon = iconMap[c.icon] ?? Bot;
            return (
              <Link key={c.slug} href={`/category/${c.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:text-primary">
                <CatIcon className="size-3.5" />
                {c.name}
              </Link>
            );
          })}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <Icon className="size-16 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold">No products yet</h2>
            <p className="text-muted-foreground">We&apos;re adding {cat.name.toLowerCase()} soon. Check back later!</p>
            <Link href="/explore" className="text-sm font-medium text-primary hover:underline">Browse all products →</Link>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <section>
                <SectionHeader title={`Featured ${cat.name}`} viewAllHref="#all" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {featured.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}
            <section id="all">
              <SectionHeader title={`All ${cat.name}`} viewAllHref="/explore" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {rest.map(p => <ProductCard key={p.id} product={p} />)}
                {featured.slice(5).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
