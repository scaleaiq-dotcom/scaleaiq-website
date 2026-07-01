"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import {
  Bot,
  Briefcase,
  Compass,
  Gift,
  GraduationCap,
  Heart,
  Home,
  LayoutTemplate,
  Menu,
  MessageSquareText,
  Newspaper,
  Search,
  ShoppingCart,
  TrendingUp,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { ModeToggle } from "@/components/layout/mode-toggle";

const navIcons: Record<string, LucideIcon> = {
  Home,
  Compass,
  Bot,
  GraduationCap,
  LayoutTemplate,
  MessageSquareText,
  TrendingUp,
  Briefcase,
  Zap,
  Gift,
  Newspaper,
};

function SearchBar({ className }: { className?: string }) {
  return (
    <form
      role="search"
      className={cn("relative w-full", className)}
      action="/explore"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder="Search for courses, tools, templates and more..."
        className="h-11 rounded-full pl-10 pr-4"
        aria-label="Search products"
      />
    </form>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* Promo bar */}
      <div className="bg-brand-gradient text-white">
        <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:text-sm">
          <span>🎉 Special Offer! Get 30% OFF on all Pro Plans. Limited Time Only!</span>
        </div>
      </div>

      {/* Main row */}
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle className="text-left">
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              {siteConfig.mobileNav.map((item) => {
                const Icon = navIcons[item.icon] ?? Compass;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                      <Icon className="size-4" />
                    </span>
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <Logo className="shrink-0" />

        {/* Desktop search */}
        <div className="mx-4 hidden flex-1 md:block">
          <SearchBar />
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            aria-label="Wishlist"
            nativeButton={false}
            render={<Link href="/account/wishlist" />}
          >
            <Heart className="size-5" />
          </Button>

          <CartButton />

          <ModeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Mobile search */}
      <div className="container mx-auto px-4 pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Desktop nav */}
      <nav className="hidden border-t lg:block">
        <div className="container mx-auto flex h-11 items-center gap-6 px-4">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                pathname === item.href && "text-primary"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

function CartButton() {
  const { toggleCart, count } = useCart();
  const cartCount = count();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="Cart"
      onClick={toggleCart}
    >
      <ShoppingCart className="size-5" />
      {cartCount > 0 && (
        <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px] tabular-nums">
          {cartCount}
        </Badge>
      )}
    </Button>
  );
}

function UserMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("@/lib/firebase/client");
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="ml-1 inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <User className="size-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const initials = user.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div ref={ref} className="relative ml-1">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white ring-2 ring-offset-2 ring-offset-background ring-primary/30 transition-all hover:ring-primary/60"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={initials} className="size-full rounded-full object-cover" />
        ) : initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border bg-card shadow-xl">
          {/* User info */}
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.displayName ?? "My Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {[
              { label: "Dashboard",    href: "/dashboard",              icon: "🏠" },
              { label: "My Library",   href: "/dashboard/library",      icon: "📚" },
              { label: "Downloads",    href: "/dashboard/downloads",    icon: "📥" },
              { label: "Wishlist",     href: "/dashboard/wishlist",     icon: "❤️" },
              { label: "Invoices",     href: "/dashboard/invoices",     icon: "🧾" },
              { label: "Profile",      href: "/dashboard/profile",      icon: "👤" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}

            {user.isAdmin && (
              <>
                <div className="my-1 border-t" />
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  <span>⚙️</span> Admin Panel
                </Link>
              </>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
