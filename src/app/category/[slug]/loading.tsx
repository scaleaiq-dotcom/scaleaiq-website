/** Instant skeleton shown the moment a category is tapped. */
export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse">
      <div className="border-b bg-gradient-to-br from-background to-accent/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-40 rounded bg-muted" />
              <div className="h-8 w-56 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 shrink-0 rounded-full bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              <div className="aspect-video bg-muted" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-4/5 rounded bg-muted" />
                <div className="h-3 w-3/5 rounded bg-muted" />
                <div className="h-5 w-16 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
