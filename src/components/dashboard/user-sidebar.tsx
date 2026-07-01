"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Wrench, Download, Award,
  Heart, Receipt, CreditCard, Trophy, User, Settings,
  X, Menu, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard",      href: "/dashboard",               icon: LayoutDashboard },
  { label: "My Library",     href: "/dashboard/library",       icon: BookOpen },
  { label: "My Courses",     href: "/dashboard/courses",       icon: BookOpen },
  { label: "My Tools",       href: "/dashboard/tools",         icon: Wrench },
  { label: "Downloads",      href: "/dashboard/downloads",     icon: Download },
  { label: "Certificates",   href: "/dashboard/certificates",  icon: Award },
  { label: "Wishlist",       href: "/dashboard/wishlist",      icon: Heart },
  { label: "Invoices",       href: "/dashboard/invoices",      icon: Receipt },
  { label: "Subscription",   href: "/dashboard/subscription",  icon: CreditCard },
  { label: "Achievements",   href: "/dashboard/achievements",  icon: Trophy },
  { label: "Profile",        href: "/dashboard/profile",       icon: User },
  { label: "Settings",       href: "/dashboard/settings",      icon: Settings },
];

export function UserSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="relative size-8 overflow-hidden rounded-lg ring-1 ring-white/10">
          <Image src="/brand/logo-mark.png" alt="ScaleAIQ" width={32} height={32} className="size-full object-cover" />
        </div>
        <span className="font-heading text-lg font-extrabold tracking-tight">
          Scale<span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">AIQ</span>
        </span>
      </div>

      {/* User info */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 font-bold text-white text-sm">
            U
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">My Account</p>
            <p className="truncate text-xs text-muted-foreground">Free Plan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {nav.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 space-y-0.5">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          ← Back to Store
        </Link>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="size-4" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex">{sidebar}</div>
      <button className="fixed left-4 top-4 z-50 rounded-lg border bg-card p-2 shadow-md lg:hidden" onClick={() => setOpen(v => !v)}>
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden">{sidebar}</div>
        </>
      )}
    </>
  );
}
