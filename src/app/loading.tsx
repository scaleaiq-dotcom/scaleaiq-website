// Instant skeleton shown during navigation to any public page.
// Renders inside the persistent Header/Footer, so only the content area animates.
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Title bar */}
      <div className="mb-6 space-y-3">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted/70" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border bg-card">
            <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-16 animate-pulse rounded bg-muted/70" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-2 flex items-center justify-between">
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="size-8 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
