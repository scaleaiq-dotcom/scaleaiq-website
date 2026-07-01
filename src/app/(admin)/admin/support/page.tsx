import type { Metadata } from "next";
export const metadata: Metadata = { title: "Support — Admin" };

export default function SupportPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Support Tickets</h1>
        <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-medium text-white">5 Open</span>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">No support tickets</p>
        <p className="mt-1 text-sm">Customer support requests will appear here.</p>
      </div>
    </div>
  );
}
