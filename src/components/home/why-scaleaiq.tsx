import { ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react";

import { stats } from "@/lib/mock-data";

const reasons = [
  {
    icon: Sparkles,
    title: "Curated & Premium",
    desc: "Every product is hand-picked for quality — no filler, only resources worth your time.",
  },
  {
    icon: Zap,
    title: "Instant Access",
    desc: "Get your downloads, courses and tools the moment your payment is confirmed.",
  },
  {
    icon: Wallet,
    title: "Affordable, Fair Pricing",
    desc: "Free, one-time or subscription — pay in ₹ with UPI, cards or netbanking.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Trusted",
    desc: "Razorpay-secured payments and protected access. 10,000+ happy learners.",
  },
];

export function WhyScaleAIQ() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-section-title font-heading">
          Why <span className="text-brand-gradient">ScaleAIQ</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          A premium marketplace built for creators and learners — intelligent
          solutions, limitless impact.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <r.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{r.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-bold text-brand-gradient sm:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
