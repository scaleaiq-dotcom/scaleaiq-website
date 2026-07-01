import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  viewAllHref,
}: {
  title: string;
  viewAllHref?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-brand-violet"
        >
          View All <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
