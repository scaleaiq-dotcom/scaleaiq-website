/** Instant skeleton shown the moment a product card is tapped. */
export default function Loading() {
  return (
    <main className="container mx-auto min-h-screen animate-pulse px-4 py-6">
      <div className="mb-6 h-3 w-64 rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="aspect-video rounded-2xl bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-72 rounded-2xl border bg-muted/60" />
          <div className="h-40 rounded-2xl border bg-muted/40" />
        </div>
      </div>
    </main>
  );
}
