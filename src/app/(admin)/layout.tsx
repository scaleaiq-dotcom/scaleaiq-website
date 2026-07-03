import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await cookies()).get("session")?.value;
  const admin = await verifyAdminSession(session);
  if (!admin) {
    redirect("/sign-in?redirect=/admin");
  }

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
