"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const titles: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/dashboard/library":      "My Library",
  "/dashboard/courses":      "My Courses",
  "/dashboard/tools":        "My Tools",
  "/dashboard/downloads":    "Downloads",
  "/dashboard/certificates": "Certificates",
  "/dashboard/wishlist":     "Wishlist",
  "/dashboard/invoices":     "Invoices",
  "/dashboard/subscription": "Subscription",
  "/dashboard/achievements": "Achievements",
  "/dashboard/profile":      "Profile",
  "/dashboard/settings":     "Settings",
};

export function UserHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 px-6 backdrop-blur-sm">
      <div className="lg:hidden w-8" />
      <h1 className="font-heading text-lg font-semibold">{titles[pathname] ?? "Dashboard"}</h1>
      <div className="ml-auto">
        <Link href="/explore" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ShoppingBag className="mr-2 size-4" /> Browse Store
        </Link>
      </div>
    </header>
  );
}
