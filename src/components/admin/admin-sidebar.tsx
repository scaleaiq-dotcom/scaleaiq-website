"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingBag, Users, Star,
  Tag, BarChart3, CreditCard, FileText, Bell, X, ChevronDown,
  CalendarCheck, HelpCircle, HardDrive, Headphones, ShieldCheck,
  Zap, ScrollText, Settings, Wrench, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package, children: [
    { label: "All Products", href: "/admin/products" },
    { label: "Add Product", href: "/admin/products/new" },
  ]},
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reviews", href: "/admin/reviews", icon: Star, badge: "3" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Workshops", href: "/admin/workshops", icon: CalendarCheck },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "File Manager", href: "/admin/file-manager", icon: HardDrive },
  { label: "Support", href: "/admin/support", icon: Headphones, badge: "5" },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
  { label: "Automation", href: "/admin/automation", icon: Zap },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
] as const;

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState<string[]>(["Products"]);

  function toggle(label: string) {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b px-4">
        <div className="relative size-8 shrink-0 overflow-hidden rounded-lg bg-primary/10">
          <Image src="/brand/logo-mark.png" alt="ScaleAIQ" width={32} height={32} className="size-full object-cover" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-heading text-base font-extrabold tracking-tight">
            Scale<span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">AIQ</span>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">Admin Panel</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto rounded-md p-1 hover:bg-accent lg:hidden">
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="px-3 pt-3">
        <Link href="/admin/products/new" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> Add Product
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {nav.map(item => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          if ("children" in item && item.children) {
            const isExpanded = expanded.includes(item.label);
            return (
              <div key={item.label}>
                <button onClick={() => toggle(item.label)} className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn("size-3.5 transition-transform", isExpanded && "rotate-180")} />
                </button>
                {isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l pl-3">
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href} onClick={onClose} className={cn("flex items-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors", pathname === child.href ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} onClick={onClose} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {"badge" in item && item.badge && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-3">
        <Link href="/admin/settings" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Wrench className="size-3.5" /> Settings & Config
        </Link>
      </div>
    </aside>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <>
      <div className="hidden lg:flex lg:h-screen lg:w-64 lg:shrink-0">
        <SidebarContent />
      </div>
      <button onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 rounded-md border bg-card p-2 shadow-sm lg:hidden">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64"><SidebarContent onClose={() => setMobileOpen(false)} /></div>
        </div>
      )}
    </>
  );
}
