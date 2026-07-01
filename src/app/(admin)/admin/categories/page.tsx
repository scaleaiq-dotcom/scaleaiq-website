import type { Metadata } from "next";
import { AdminCategories } from "@/components/admin/admin-categories";

export const metadata: Metadata = { title: "Categories — Admin" };

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}
