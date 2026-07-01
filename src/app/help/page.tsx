import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Download, CreditCard, User, Package, MessageSquare, ArrowRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — ScaleAIQ",
  description: "Find answers, guides, and support for all things ScaleAIQ.",
};

const TOPICS = [
  {
    icon: Package,
    title: "Getting Started",
    desc: "New to ScaleAIQ? Learn how to browse, purchase, and access products.",
    links: [
      { label: "How to create an account", href: "/faq#account" },
      { label: "Browsing the marketplace", href: "/explore" },
      { label: "How to make a purchase", href: "/faq#purchase" },
    ],
  },
  {
    icon: Download,
    title: "Downloads & Access",
    desc: "How to access your purchased products, downloads, and course content.",
    links: [
      { label: "Where are my downloads?", href: "/dashboard/downloads" },
      { label: "Download not working?", href: "/faq#downloads" },
      { label: "Re-download a product", href: "/dashboard/library" },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    desc: "Payment methods, invoices, and understanding your charges.",
    links: [
      { label: "Accepted payment methods", href: "/faq#payments" },
      { label: "View your invoices", href: "/dashboard/invoices" },
      { label: "Refund policy", href: "/refund" },
    ],
  },
  {
    icon: User,
    title: "Account & Profile",
    desc: "Manage your account, change password, or update your profile.",
    links: [
      { label: "Update your profile", href: "/dashboard/profile" },
      { label: "Change email or password", href: "/dashboard/settings" },
      { label: "Delete your account", href: "/contact" },
    ],
  },
  {
    icon: Package,
    title: "Products & Quality",
    desc: "Questions about specific products, updates, or reporting issues.",
    links: [
      { label: "Product not as described", href: "/refund" },
      { label: "Request a product update", href: "/contact" },
      { label: "Report a problem", href: "/contact" },
    ],
  },
  {
    icon: MessageSquare,
    title: "Contact & Support",
    desc: "Can't find an answer? Our team is ready to help.",
    links: [
      { label: "Contact support", href: "/contact" },
      { label: "Email: scaleaiq@gmail.com", href: "mailto:scaleaiq@gmail.com" },
      { label: "Browse all FAQs", href: "/faq" },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" /> Help Center
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            How can we help you?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Find answers to common questions, or reach out directly — we're here to help.
          </p>
          <div className="relative mx-auto mt-6 max-w-md">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Link href="/faq">
              <div className="flex h-12 w-full cursor-pointer items-center rounded-xl border bg-card pl-11 pr-4 text-sm text-muted-foreground shadow-sm hover:border-primary">
                Search help articles…
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Topics grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ icon: Icon, title, desc, links }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h2 className="font-heading text-base font-bold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <ul className="mt-4 space-y-2">
                {links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <ArrowRight className="size-3.5 shrink-0" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mx-auto mt-14 max-w-lg rounded-2xl border bg-card p-8 text-center">
          <MessageSquare className="mx-auto size-10 text-primary/60" />
          <h2 className="mt-3 font-heading text-lg font-bold">Still can't find your answer?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our support team typically replies within 24 hours.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/faq"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
              Browse FAQs
            </Link>
            <Link href="/contact"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
