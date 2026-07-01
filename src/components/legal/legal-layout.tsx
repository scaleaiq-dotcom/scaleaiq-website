import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

interface Props {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, updated, children }: Props) {
  return (
    <main className="min-h-screen">
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-12">
          <Link href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl space-y-8">
          {children}
        </div>

        {/* Footer nav */}
        <div className="mx-auto mt-12 max-w-2xl border-t pt-8">
          <p className="text-sm text-muted-foreground">Related policies:</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { label: "Terms of Use", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Refund Policy", href: "/refund" },
              { label: "Contact Us", href: "/contact" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
