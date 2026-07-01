import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <div className="relative size-9 overflow-hidden rounded-xl shadow-md ring-1 ring-white/10">
        <Image
          src="/brand/logo-mark.png"
          alt="ScaleAIQ logo"
          width={36}
          height={36}
          priority
          className="size-full object-cover"
        />
      </div>
      {showWordmark && (
        <span className="font-heading text-xl font-extrabold tracking-tight">
          Scale<span className="text-brand-gradient">AIQ</span>
        </span>
      )}
    </Link>
  );
}
