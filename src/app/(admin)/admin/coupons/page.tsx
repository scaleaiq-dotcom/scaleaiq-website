import type { Metadata } from "next";
import { AdminCoupons } from "@/components/admin/admin-coupons";
export const metadata: Metadata = { title: "Coupons — Admin" };
export default function AdminCouponsPage() { return <AdminCoupons />; }
