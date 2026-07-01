import type { Metadata } from "next";
export const metadata: Metadata = { title: "My Tools — ScaleAIQ" };

export default function ToolsPage() {
  return (
    <div className="rounded-xl border bg-card p-12 text-center">
      <p className="text-4xl">🔧</p>
      <p className="mt-3 font-heading text-lg font-semibold">No tools yet</p>
      <p className="mt-1 text-sm text-muted-foreground">AI tools you subscribe to will appear here with quick access links</p>
      <a href="/category/ai-tools" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Browse AI Tools</a>
    </div>
  );
}
