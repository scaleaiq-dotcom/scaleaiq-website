import type { Metadata } from "next";
export const metadata: Metadata = { title: "Reports — Admin" };

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Revenue, orders, and growth analytics.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Revenue Report", "Orders Report", "User Growth"].map(r => (
          <div key={r} className="cursor-pointer rounded-xl border bg-card p-6 transition-colors hover:border-primary/50">
            <p className="font-semibold">{r}</p>
            <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
