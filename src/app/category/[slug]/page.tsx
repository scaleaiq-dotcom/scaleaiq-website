import type { Metadata } from "next";
import Link from "next/link";
import { Bot, GraduationCap, LayoutTemplate, MessageSquareText, BookOpen, TrendingUp, Briefcase, Palette, Zap, Gift, Bell, type LucideIcon } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { NotifyMeForm } from "@/components/home/notify-me-form";
import { getCategories, getProductsByCategory } from "@/lib/firebase/products";

export const revalidate = 120;

// Pre-render every category page at build time (ISR keeps them fresh).
export async function generateStaticParams() {
  try {
    const cats = await getCategories();
    return cats.map(c => ({ slug: c.slug })).filter(p => p.slug);
  } catch {
    return [];
  }
}

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

  // Known slugs that may not exist in Firestore yet — show Coming Soon instead of 404
  const knownSlugs = ["ai-tools", "courses", "templates", "prompts", "ebooks", "finance", "business", "automation", "design", "free"];
  if (!cat) {
    if (!knownSlugs.includes(slug)) {
      const { notFound } = await import("next/navigation");
      notFound();
    }
    // Show coming soon page
    const label = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return (
      <main className="min-h-screen">
        <div className="flex flex-col items-center justify-center gap-6 px-4 py-32 text-center">
          <Bell className="size-16 text-primary/30" />
          <h1 className="font-heading text-3xl font-bold">{label} — Coming Soon</h1>
          <p className="max-w-md text-muted-foreground">We&apos;re curating the best {label.toLowerCase()} content. Be the first to know when it launches!</p>
          <div className="w-full max-w-sm">
            <NotifyMeForm category={slug} />
          </div>
          <Link href="/explore" className="text-sm font-medium text-primary hover:underline">Browse available products →</Link>
        </div>
      </main>
    );
  }

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
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <Icon className="size-16 text-muted-foreground/30" />
            <div>
              <h2 className="text-2xl font-bold">Coming Soon!</h2>
              <p className="mt-2 max-w-md text-muted-foreground">We&apos;re adding premium {cat.name.toLowerCase()} content. Get notified when it&apos;s ready!</p>
            </div>
            <div className="w-full max-w-sm">
              <NotifyMeForm category={slug} />
            </div>
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
