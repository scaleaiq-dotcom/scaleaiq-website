import Link from "next/link";
import {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  TrendingUp, Briefcase, Zap, Gift, Palette, BookOpen, type LucideIcon,
} from "lucide-react";

import type { Category } from "@/types/product";
import { SectionHeader } from "@/components/home/section-header";

const iconMap: Record<string, LucideIcon> = {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  TrendingUp, Briefcase, Zap, Gift, Palette, BookOpen,
};

const defaultAccent: Record<string, string> = {
  "ai-tools": "#00c8ff", courses: "#7b3dff", finance: "#22c55e",
  business: "#0066ff", prompts: "#d946ff", templates: "#0066ff",
  free: "#f59e0b", automation: "#7b3dff", design: "#f97316", ebooks: "#06b6d4",
};

export function CategorySection({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <section id="categories" className="container mx-auto scroll-mt-24 px-4 py-6">
      <SectionHeader title="Popular Categories" viewAllHref="/explore" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Bot;
          const accent = cat.accentColor ?? defaultAccent[cat.slug] ?? "#7b3dff";
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span
                className="flex size-14 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: accent + "20" }}
              >
                <Icon className="size-7" strokeWidth={2.2} style={{ color: accent }} />
              </span>
              <span className="text-xs font-semibold leading-tight text-foreground">
                {cat.name}
              </span>
              {cat.productCount != null && (
                <span className="text-[10px] text-muted-foreground">
                  {cat.productCount}+ Products
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
