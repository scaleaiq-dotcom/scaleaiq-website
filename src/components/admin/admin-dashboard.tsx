"use client";

import * as React from "react";
import Link from "next/link";
import {
  IndianRupee, ShoppingBag, Package, Users, Download, CreditCard,
  TrendingUp, Plus, Tag, Bell, CheckCircle2, Circle, CalendarDays,
  Loader2, RefreshCw, HardDrive, ExternalLink, Database,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

/* ─── Types ───────────────────────────────────────────── */
interface Stats {
  products: number; orders: number; users: number;
  revenue: number; downloads: number;
  recentOrders: { id: string; name: string; product: string; amount: string; status: string; createdAt: string | null }[];
  recentActivity: { text: string; createdAt: string | null }[];
}

const EMPTY_STATS: Stats = {
  products: 0, orders: 0, users: 0, revenue: 0, downloads: 0,
  recentOrders: [], recentActivity: [],
};

/* ─── Goals (localStorage) ────────────────────────────── */
const DEFAULT_GOALS = [
  "Publish a product today",
  "Post on Instagram",
  "Promote Workshop",
  "Reply to customer queries",
  "Check analytics",
];

function useGoals() {
  const [goals, setGoals] = React.useState<{ label: string; done: boolean }[]>([]);
  React.useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("admin_goals_" + today);
    if (saved) { setGoals(JSON.parse(saved)); return; }
    setGoals(DEFAULT_GOALS.map(label => ({ label, done: false })));
  }, []);

  function toggle(i: number) {
    setGoals(prev => {
      const next = prev.map((g, j) => j === i ? { ...g, done: !g.done } : g);
      localStorage.setItem("admin_goals_" + new Date().toDateString(), JSON.stringify(next));
      return next;
    });
  }
  return { goals, toggle };
}

/* ─── Helpers ─────────────────────────────────────────── */
function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

const DOT_COLORS = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-cyan-500","bg-rose-500"];

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600",
  paid:      "bg-emerald-500/10 text-emerald-600",
  pending:   "bg-amber-500/10 text-amber-600",
  refunded:  "bg-rose-500/10 text-rose-600",
  free:      "bg-blue-500/10 text-blue-600",
};

/* ─── SVG Chart (7-point line) ────────────────────────── */
function SalesChart({ orders }: { orders: Stats["recentOrders"] }) {
  const W = 540, H = 150, P = 20;

  // Build last-7-day buckets from real orders
  const days: { label: string; v: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const v = orders
      .filter(o => o.createdAt && new Date(o.createdAt).toDateString() === key)
      .reduce((s, o) => s + parseInt(o.amount.replace(/[^\d]/g, "") || "0", 10), 0);
    days.push({ label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), v });
  }

  const hasData = days.some(d => d.v > 0);
  const vals = hasData ? days.map(d => d.v) : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...vals, 1), min = 0, range = max - min;

  const pts = days.map((d, i) => ({
    x: P + (i / (days.length - 1)) * (W - P * 2),
    y: P + (1 - (d.v - min) / range) * (H - P * 2),
    ...d,
  }));

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = path + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7b3dff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#7b3dff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {hasData && <path d={area} fill="url(#cg)" />}
      <path d={path} fill="none" stroke="#7b3dff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#7b3dff" />
          <circle cx={p.x} cy={p.y} r="8" fill="#7b3dff" fillOpacity="0.12" />
          <text x={p.x} y={H + 16} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {p.label.split(" ")[0]}
          </text>
        </g>
      ))}
      {!hasData && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="11" fill="#9ca3af">
          No sales yet — data will appear here
        </text>
      )}
    </svg>
  );
}

/* ─── Component ───────────────────────────────────────── */
export function AdminDashboard() {
  const { user } = useAuth();
  const { goals, toggle } = useGoals();
  const [stats, setStats] = React.useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  async function fetchStats() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Could not load stats. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { fetchStats(); }, []);

  const firstName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Admin";
  const doneCount = goals.filter(g => g.done).length;

  const statCards = [
    { label: "Revenue",       value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-violet-500", bg: "bg-violet-500/10", href: "/admin/orders" },
    { label: "Orders",        value: stats.orders,      icon: ShoppingBag, color: "text-blue-500",    bg: "bg-blue-500/10",    href: "/admin/orders" },
    { label: "Products",      value: stats.products,    icon: Package,     color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/admin/products" },
    { label: "Users",         value: stats.users,       icon: Users,       color: "text-amber-500",   bg: "bg-amber-500/10",   href: "/admin/users" },
    { label: "Downloads",     value: stats.downloads,   icon: Download,    color: "text-cyan-500",    bg: "bg-cyan-500/10",    href: "/admin/orders" },
    { label: "Subscriptions", value: 0,                 icon: CreditCard,  color: "text-rose-500",    bg: "bg-rose-500/10",    href: "/admin/subscriptions" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Welcome back, {loading ? "…" : firstName}!
          </h1>
          <p className="text-sm text-muted-foreground">Here is what is happening with your platform today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStats} disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </button>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className="font-medium">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map(s => (
          <Link key={s.label} href={s.href}
            className="cursor-pointer rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm active:scale-95">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
              <div className={cn("rounded-lg p-1.5", s.bg)}>
                <s.icon className={cn("size-3.5", s.color)} />
              </div>
            </div>
            {loading
              ? <div className="h-7 w-16 animate-pulse rounded bg-muted" />
              : <p className="font-heading text-xl font-bold">{s.value}</p>
            }
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="size-3 text-emerald-500" />
              <span>Live data</span>
            </p>
          </Link>
        ))}
      </div>

      <UsageCard />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/products/new" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs")}><Plus className="size-3.5" /> Add Product</Link>
        <Link href="/admin/categories"   className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs")}><Tag className="size-3.5" /> Add Category</Link>
        <Link href="/admin/workshops"    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>Create Workshop</Link>
        <Link href="/admin/blog"         className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>Write Blog</Link>
        <Link href="/admin/notifications" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs")}><Bell className="size-3.5" /> Send Notification</Link>
        <Link href="/admin/coupons"      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>Create Coupon</Link>
      </div>

      {/* Chart + Top products */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Sales — Last 7 Days</h2>
            {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <SalesChart orders={stats.recentOrders} />
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Quick Stats</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">All Orders</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <ShoppingBag className="size-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((o, i) => (
                <div key={o.id} className="flex items-center gap-3">
                  <span className="w-3 text-xs text-muted-foreground">{i + 1}</span>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {o.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate text-xs font-medium">{o.product}</span>
                  <span className="text-xs font-semibold">{o.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders table + goals + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}>View All</Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <ShoppingBag className="size-12 text-muted-foreground/20" />
              <p className="font-medium text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground">Orders will appear here once customers purchase.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {stats.recentOrders.map(o => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/50">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {o.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{o.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{o.product}</p>
                  </div>
                  <span className="text-xs font-semibold">{o.amount}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_BADGE[o.status] ?? "bg-muted text-muted-foreground")}>
                    {o.status}
                  </span>
                  <span className="hidden whitespace-nowrap text-[10px] text-muted-foreground sm:block">{timeAgo(o.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Today's goals */}
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold">Today&apos;s Goals</h2>
              <span className="text-xs text-muted-foreground">{doneCount}/{goals.length}</span>
            </div>
            <div className="space-y-2">
              {goals.map((g, i) => (
                <button key={i} onClick={() => toggle(i)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-accent/50 active:scale-95">
                  {g.done
                    ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    : <Circle className="size-4 shrink-0 text-muted-foreground/30" />
                  }
                  <span className={cn("text-xs leading-snug", g.done && "line-through text-muted-foreground")}>{g.label}</span>
                </button>
              ))}
            </div>
            {goals.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(doneCount / goals.length) * 100}%` }} />
                </div>
                <p className="mt-1 text-right text-[10px] text-muted-foreground">{Math.round((doneCount / goals.length) * 100)}% complete</p>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="mb-3 font-heading text-sm font-semibold">Recent Activity</h2>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}
              </div>
            ) : stats.recentActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", DOT_COLORS[i % DOT_COLORS.length])} />
                    <div>
                      <p className="text-xs leading-snug">{a.text}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming workshop placeholder */}
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 p-5 text-white">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold">Workshops</h2>
              <Link href="/admin/workshops" className="text-[10px] text-white/70 hover:text-white">Manage</Link>
            </div>
            <p className="text-sm text-white/80">No upcoming workshops</p>
            <Link href="/admin/workshops"
              className="mt-3 inline-block cursor-pointer rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/30 active:scale-95">
              + Create Workshop
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ─── Firebase usage (storage measured live; reads/writes in console) ── */
function UsageCard() {
  const [used, setUsed] = React.useState<number | null>(null);
  const [quota, setQuota] = React.useState(1024 ** 3);

  React.useEffect(() => {
    fetch("/api/admin/storage")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setUsed(d.totalBytes ?? 0); setQuota(d.quotaBytes ?? 1024 ** 3); } })
      .catch(() => {});
  }, []);

  const fmt = (b: number) => b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB` : b >= 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const pct = used === null ? 0 : Math.min((used / quota) * 100, 100);
  const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-primary";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Storage — live */}
      <Link href="/admin/file-manager"
        className="rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <HardDrive className="size-3.5" /> File Storage
          </span>
          <span className="text-[11px] text-muted-foreground">
            {used === null ? "…" : <>{fmt(used)} / {fmt(quota)} free tier</>}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${Math.max(pct, 1)}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">Manage &amp; delete files in File Manager →</p>
      </Link>

      {/* Firestore reads/writes — console only */}
      <a href={`https://console.firebase.google.com/project/${projectId}/usage`} target="_blank" rel="noopener noreferrer"
        className="rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Database className="size-3.5" /> Database Reads / Writes
          </span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold">Free daily quota: 50K reads · 20K writes</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Firebase only shows live counts in its own console — tap to open your usage page.
        </p>
      </a>
    </div>
  );
}
