import type { Metadata } from "next";
export const metadata: Metadata = { title: "Subscription — ScaleAIQ" };

export default function SubscriptionPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-heading text-base font-semibold">Current Plan</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-2xl">🆓</div>
          <div>
            <p className="font-semibold">Free Plan</p>
            <p className="text-sm text-muted-foreground">Browse and download free products</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-heading text-base font-semibold">Tool Subscriptions</h2>
        <div className="rounded-lg bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          <p>You haven't subscribed to any tools yet.</p>
          <a href="/category/ai-tools" className="mt-2 inline-block font-medium text-primary hover:underline">Browse AI Tools →</a>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-heading text-base font-semibold">Billing History</h2>
        <p className="text-sm text-muted-foreground">No billing history found.</p>
      </div>
    </div>
  );
}
