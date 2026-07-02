import type { Metadata } from "next";
import { FileManagerClient } from "@/components/admin/file-manager-client";

export const metadata: Metadata = { title: "File Manager — Admin" };

export default function FileManagerPage() {
  return <FileManagerClient />;
}
