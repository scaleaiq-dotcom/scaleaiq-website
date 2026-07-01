import type { Metadata } from "next";
import { AdminBlog } from "@/components/admin/admin-blog";
export const metadata: Metadata = { title: "Blog — Admin" };
export default function AdminBlogPage() { return <AdminBlog />; }
