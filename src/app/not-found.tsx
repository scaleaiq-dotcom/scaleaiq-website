import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
        <Compass className="size-10 text-primary" />
      </div>
      <h1 className="mt-6 font-heading text-6xl font-extrabold tracking-tight text-primary">404</h1>
      <p className="mt-2 font-heading text-2xl font-bold">Page Not Found</p>
      <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
          Go Home
        </Link>
        <Link href="/explore"
          className="rounded-xl border px-6 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
          Browse Products
        </Link>
      </div>
    </main>
  );
}
