import Link from "next/link";
import {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  TrendingUp, Briefcase, Zap, Gift, Palette, type LucideIcon,
} from "lucide-react";

import { categories } from "@/lib/mock-data";
import { SectionHeader } from "@/components/home/section-header";

const iconMap: Record<string, LucideIcon> = {
  Bot, GraduationCap, LayoutTemplate, MessageSquareText,
  TrendingUp, Briefcase, Zap, Gift, Palette,
};

export function CategorySection() {
  return (
    <section id="categories" className="container mx-auto scroll-mt-24 px-4 py-6">
      <SectionHeader title="Popular Categories" viewAllHref="/explore" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Bot;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span
                className="flex size-14 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: cat.accentColor + "20" }}
              >
                <Icon
                  className="size-7"
                  strokeWidth={2.2}
                  style={{ color: cat.accentColor }}
                />
              </span>
              <span className="text-xs font-semibold leading-tight text-foreground">
                {cat.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {cat.productCount}+ Products
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
