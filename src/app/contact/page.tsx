import type { Metadata } from "next";
import { ContactClient } from "@/components/contact/contact-client";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — ScaleAIQ",
  description: "Get in touch with the ScaleAIQ team. We're here to help.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MessageSquare className="size-3.5" /> Contact
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            We&apos;re Here to Help
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Have a question, partnership inquiry, or need support? Send us a message — we reply within 24 hours.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <ContactClient />

          {/* Info */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: "Email Us",
                desc: "For general enquiries and partnerships",
                value: "hello@scaleaiq.in",
                href: "mailto:hello@scaleaiq.in",
              },
              {
                icon: MessageSquare,
                title: "Support",
                desc: "For product or account issues",
                value: "support@scaleaiq.in",
                href: "mailto:support@scaleaiq.in",
              },
              {
                icon: Clock,
                title: "Response Time",
                desc: "We typically reply within",
                value: "24 hours",
                href: null,
              },
            ].map(({ icon: Icon, title, desc, value, href }) => (
              <div key={title} className="flex gap-4 rounded-2xl border bg-card p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                  {href ? (
                    <a href={href} className="mt-1 block text-sm font-medium text-primary hover:underline">{value}</a>
                  ) : (
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border bg-card p-5">
              <p className="font-semibold">Follow Us</p>
              <p className="mt-1 text-sm text-muted-foreground">Stay updated on new products and launches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Instagram", href: "https://instagram.com" },
                  { label: "WhatsApp", href: "https://whatsapp.com" },
                  { label: "YouTube", href: "https://youtube.com" },
                  { label: "LinkedIn", href: "https://linkedin.com" },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
