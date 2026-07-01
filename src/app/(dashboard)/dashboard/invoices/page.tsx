"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Download, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Invoice {
  id: string;
  invoiceNumber: string;
  productTitle: string;
  amount: number;
  status: string;
  createdAt: string | null;
  razorpayOrderId?: string;
}

export default function InvoicesPage() {
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) { setDataLoading(false); return; }

    async function load() {
      const { db } = await import("@/lib/firebase/client");
      const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore");

      const snap = await getDocs(
        query(collection(db, "orders"), where("userId", "==", user!.uid), orderBy("createdAt", "desc"))
      ).catch(() => null);

      if (snap) {
        setInvoices(snap.docs.map((d, i) => {
          const data = d.data();
          const date = data.createdAt?.toDate?.();
          const invoiceNum = date
            ? `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(i + 1).padStart(4, "0")}`
            : `INV-${d.id.slice(-6).toUpperCase()}`;
          return {
            id: d.id,
            invoiceNumber: data.invoiceNumber ?? invoiceNum,
            productTitle: data.productTitle ?? "Product",
            amount: data.amount ?? 0,
            status: data.status ?? "completed",
            createdAt: date?.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) ?? null,
            razorpayOrderId: data.razorpay_order_id,
          };
        }));
      }
      setDataLoading(false);
    }

    load();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Download GST-ready invoices for all your purchases.</p>
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Invoice #</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Download</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <FileText className="mx-auto size-10 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No invoices yet</p>
                  <Link href="/explore" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">Browse products →</Link>
                </td>
              </tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-medium">{inv.invoiceNumber}</span>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="max-w-[180px] truncate block text-sm">{inv.productTitle}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> {inv.createdAt ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold">₹{inv.amount}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => alert("Invoice download coming soon!")}
                    className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                    <Download className="size-3.5" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
