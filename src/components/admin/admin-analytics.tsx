"use client";

import { BarChart3, IndianRupee, ShoppingBag, Users, TrendingUp, Package } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₹0", change: "+0%", icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Total Orders", value: "0", change: "+0%", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Unique Customers", value: "0", change: "+0%", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Products Sold", value: "0", change: "+0%", icon: Package, color: "text-amber-500", bg: "bg-amber-500/10" },
];

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {["7 days", "30 days", "90 days", "All time"].map(p => (
          <button key={p} className={`rounded-full px-3 py-1 text-xs font-medium ${p === "30 days" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={`rounded-lg p-1.5 ${s.bg}`}><s.icon className={`size-4 ${s.color}`} /></span>
            </div>
            <p className="mt-3 font-heading text-2xl font-bold">{s.value}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3" />{s.change} vs last period
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-heading text-sm font-semibold">Revenue Over Time</h2>
        <div className="flex h-48 items-center justify-center rounded-lg bg-muted/30">
          <div className="text-center">
            <BarChart3 className="mx-auto size-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Chart will appear once you have orders</p>
          </div>
        </div>
      </div>

      {/* Top products placeholder */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-heading text-sm font-semibold">Top Products</h2>
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">No sales data yet</p>
        </div>
      </div>
    </div>
  );
}
