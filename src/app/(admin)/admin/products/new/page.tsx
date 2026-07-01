import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = { title: "New Product — Admin" };

export default function NewProductPage() {
  return <ProductEditor />;
}
