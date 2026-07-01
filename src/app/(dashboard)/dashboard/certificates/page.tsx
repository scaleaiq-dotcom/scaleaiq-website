import type { Metadata } from "next";
export const metadata: Metadata = { title: "Certificates — ScaleAIQ" };

export default function CertificatesPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Certificates are issued upon completing eligible courses.</p>
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-4xl">🏆</p>
        <p className="mt-3 font-heading text-lg font-semibold">No certificates yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Complete a course to earn your certificate</p>
        <a href="/category/courses" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Browse Courses</a>
      </div>
    </div>
  );
}
