import Link from "next/link";
import {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  TrendingUp, Briefcase, Zap, Gift, Palette, BookOpen, Images, type LucideIcon,
} from "lucide-react";

import type { Category } from "@/types/product";
import { SectionHeader } from "@/components/home/section-header";

const iconMap: Record<string, LucideIcon> = {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  TrendingUp, Briefcase, Zap, Gift, Palette, BookOpen, Images, Image: Images,
};

// Fallback icon by slug when the stored icon name isn't recognised.
const slugIcon: Record<string, LucideIcon> = {
  images: Images, "image-bundles": Images, photos: Images,
};

const defaultAccent: Record<string, string> = {
  "ai-tools": "#00c8ff", courses: "#7b3dff", finance: "#22c55e",
  business: "#0066ff", prompts: "#d946ff", templates: "#0066ff",
  free: "#f59e0b", automation: "#7b3dff", design: "#f97316", ebooks: "#06b6d4",
  images: "#ec4899", "image-bundles": "#ec4899",
};

export function CategorySection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section id="categories" className="container mx-auto scroll-mt-24 px-4 py-6">
      <SectionHeader title="Popular Categories" viewAllHref="/explore" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3 lg:grid-cols-9">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? slugIcon[cat.slug] ?? Bot;
          const accent = cat.accentColor ?? defaultAccent[cat.slug] ?? "#7b3dff";
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-1.5 rounded-xl border bg-card px-1.5 py-2.5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:gap-2 sm:rounded-2xl sm:px-2 sm:py-4"
            >
              <span
                className="flex size-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 sm:size-14 sm:rounded-xl"
                style={{ background: accent + "20" }}
              >
                <Icon className="size-4.5 sm:size-7" strokeWidth={2.2} style={{ color: accent }} />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                {cat.name}
              </span>
              {(cat.productCount ?? 0) > 0 && (
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {cat.productCount} Product{cat.productCount === 1 ? "" : "s"}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
