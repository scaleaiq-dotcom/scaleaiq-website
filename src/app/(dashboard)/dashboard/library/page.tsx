import type { Metadata } from "next";
export const metadata: Metadata = { title: "My Library — ScaleAIQ" };

export default function LibraryPage() {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {["All", "Downloads", "Courses", "Tools", "Prompts"].map(f => (
          <button key={f} className={`rounded-full px-3 py-1 text-xs font-medium ${f === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</button>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-4xl">📚</p>
        <p className="mt-3 font-heading text-lg font-semibold">Your library is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">All your purchased products will appear here for instant access</p>
        <a href="/explore" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Browse Products</a>
      </div>
    </div>
  );
}
