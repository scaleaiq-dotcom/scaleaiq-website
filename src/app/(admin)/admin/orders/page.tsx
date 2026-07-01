import type { Metadata } from "next";
import { AdminOrders } from "@/components/admin/admin-orders";

export const metadata: Metadata = { title: "Orders — Admin" };

export default function AdminOrdersPage() {
  return <AdminOrders />;
}
