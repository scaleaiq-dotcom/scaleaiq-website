import type { Metadata } from "next";
import { AdminSubscriptions } from "@/components/admin/admin-subscriptions";
export const metadata: Metadata = { title: "Subscriptions — Admin" };
export default function AdminSubscriptionsPage() { return <AdminSubscriptions />; }
