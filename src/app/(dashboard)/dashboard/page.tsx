"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, Download, Heart, Award, Clock, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Order {
  id: string;
  productTitle: string;
  productSlug?: string;
  amount: number;
  status: string;
  createdAt: string | null;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) { setDataLoading(false); return; }

    async function load() {
      const { db } = await import("@/lib/firebase/client");
      const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore");

      const [ordersSnap, wishSnap] = await Promise.all([
        getDocs(query(collection(db, "orders"), where("userId", "==", user!.uid), orderBy("createdAt", "desc"), limit(5))),
        getDocs(collection(db, "wishlists", user!.uid, "items")),
      ]);

      setOrders(ordersSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          productTitle: data.productTitle ?? "Product",
          productSlug: data.productSlug,
          amount: data.amount ?? 0,
          status: data.status ?? "completed",
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString("en-IN") ?? null,
        };
      }));
      setWishlistCount(wishSnap.size);
      setDataLoading(false);
    }

    load().catch(() => setDataLoading(false));
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Purchases",  value: orders.length, icon: ShoppingBag, href: "/dashboard/invoices" },
    { label: "Downloads",  value: orders.length, icon: Download,    href: "/dashboard/downloads" },
    { label: "Wishlist",   value: wishlistCount,  icon: Heart,       href: "/dashboard/wishlist" },
    { label: "Certificates", value: 0,            icon: Award,       href: "/dashboard/certificates" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 p-6 text-white">
        <h2 className="font-heading text-2xl font-bold">
          Welcome back{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! 👋
        </h2>
        <p className="mt-1 text-white/80">Here's what's happening with your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm">
            <Icon className="size-5 text-primary" />
            <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent purchases */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold">Recent Purchases</h3>
          {orders.length > 0 && (
            <Link href="/dashboard/invoices" className="text-xs font-medium text-primary hover:underline">View all →</Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">No purchases yet</p>
            <p className="text-sm text-muted-foreground">Your purchased products will appear here</p>
            <Link href="/explore" className="mt-2 text-sm font-medium text-primary hover:underline">Browse the marketplace →</Link>
          </div>
        ) : (
          <div className="divide-y">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{order.productTitle}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {order.createdAt ?? "—"}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">₹{order.amount}</p>
                  {order.productSlug && (
                    <Link href={`/product/${order.productSlug}`}>
                      <ExternalLink className="size-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
