"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ExternalLink, Moon, Sun, Search, ChevronDown, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
  "/admin/reviews": "Reviews",
  "/admin/coupons": "Coupons",
  "/admin/subscriptions": "Subscriptions",
  "/admin/blog": "Blog",
  "/admin/notifications": "Notifications",
  "/admin/workshops": "Workshops",
  "/admin/faq": "FAQ",
  "/admin/file-manager": "File Manager",
  "/admin/support": "Support",
  "/admin/reports": "Reports",
  "/admin/settings": "Settings",
  "/admin/roles": "Roles & Permissions",
  "/admin/automation": "Automation",
  "/admin/audit-logs": "Audit Logs",
};

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [dark, setDark] = React.useState(false);
  const [dropOpen, setDropOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const title = titles[pathname] ?? (pathname.includes("/products/") ? "Edit Product" : "Admin");
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function handleSignOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    const { signOut, getAuth } = await import("firebase/auth");
    await signOut(getAuth());
    router.push("/sign-in");
  }

  const initials = user?.displayName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-sm">
      <div className="lg:hidden w-10" />

      {/* Search */}
      <div className="relative hidden sm:flex flex-1 max-w-sm items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search anything..."
          className="h-9 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <kbd className="absolute right-3 rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">⌘K</kbd>
      </div>

      <div className="hidden sm:block text-xs text-muted-foreground">{today}</div>

      <div className="ml-auto flex items-center gap-1.5">
        <Link href="/" target="_blank" className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <ExternalLink className="size-4" />
        </Link>

        <button onClick={() => setDark(d => !d)} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropOpen(d => !d)}
            className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 hover:bg-accent transition-colors"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-[11px] font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold">{user?.displayName ?? "Admin"}</span>
              <span className="text-[10px] text-muted-foreground">Super Admin</span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border bg-card p-1 shadow-xl">
                <div className="border-b px-3 py-2 mb-1">
                  <p className="text-xs font-semibold">{user?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link href="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <LayoutDashboard className="size-3.5" /> Dashboard
                </Link>
                <Link href="/admin/settings" onClick={() => setDropOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <User className="size-3.5" /> Profile
                </Link>
                <div className="my-1 border-t" />
                <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors">
                  <LogOut className="size-3.5" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
