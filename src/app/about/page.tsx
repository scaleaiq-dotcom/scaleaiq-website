import type { Metadata } from "next";
import Link from "next/link";
import { Zap, GraduationCap, Sparkles, BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — ScaleAIQ",
  description: "ScaleAIQ is India's AI & digital marketplace — discover tools, courses, templates, and automation resources built for the modern creator.",
};

const VALUES = [
  { icon: GraduationCap, title: "Expert-Curated", desc: "High-quality learning, curated by people who know the field." },
  { icon: Sparkles,      title: "AI Powered",     desc: "A smarter learning experience built around modern AI tools." },
  { icon: BookOpen,      title: "New Content",    desc: "Fresh tools, templates, and courses added regularly." },
  { icon: Zap,           title: "Instant Access", desc: "Learn anytime, anywhere — access everything the moment you join." },
];

const STATS = [
  { value: "10,000+", label: "Products" },
  { value: "50,000+", label: "Learners" },
  { value: "₹49",     label: "Starting price" },
  { value: "100%",    label: "Instant access" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Our Story
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Empowering India with <span className="text-primary">AI & Digital Skills</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            ScaleAIQ was built with one goal — make premium AI tools, courses, and digital resources accessible to every creator, student, and entrepreneur in India at prices that make sense.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
              Explore Products <ArrowRight className="size-4" />
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight">Our Mission</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            The AI revolution is happening now — and we believe everyone should have access to the tools and knowledge to thrive in it. ScaleAIQ curates the best AI tools, prompt packs, automation templates, courses, and digital resources so you can learn faster, work smarter, and build bigger.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We're not just a marketplace — we're a community of builders, learners, and creators who believe that the right tools, at the right price, can change careers and businesses.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="mb-10 text-center font-heading text-3xl font-extrabold tracking-tight">Why Learn With Us</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="font-heading text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight">Ready to scale with AI?</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Join thousands of learners and creators who've already discovered the ScaleAIQ marketplace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
            Browse Products <ArrowRight className="size-4" />
          </Link>
          <Link href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border px-8 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
