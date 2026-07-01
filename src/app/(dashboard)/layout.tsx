import { UserSidebar } from "@/components/dashboard/user-sidebar";
import { UserHeader } from "@/components/dashboard/user-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-muted/20">
      <UserSidebar />
      <div className="flex flex-1 flex-col lg:pl-64">
        <UserHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
