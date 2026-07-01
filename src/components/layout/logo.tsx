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
      <Image
        src="/brand/Logo - Mark.png"
        alt="ScaleAIQ"
        width={160}
        height={44}
        priority
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}
