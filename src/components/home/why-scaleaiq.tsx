import { ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react";

const reasons = [
  {
    icon: Sparkles,
    color: "from-violet-500 to-indigo-500",
    title: "Curated & Premium",
    desc: "Every product is hand-picked for quality — no filler, only resources worth your time and money.",
  },
  {
    icon: Zap,
    color: "from-cyan-500 to-blue-500",
    title: "Instant Access",
    desc: "Get your downloads, courses and tools the moment your payment is confirmed. No waiting.",
  },
  {
    icon: Wallet,
    color: "from-emerald-500 to-teal-500",
    title: "Affordable, Fair Pricing",
    desc: "Free, one-time or subscription — pay in ₹ with UPI, cards or netbanking.",
  },
  {
    icon: ShieldCheck,
    color: "from-orange-500 to-rose-500",
    title: "Secure & Trusted",
    desc: "Razorpay-secured payments and protected access. Built for Indian learners and creators.",
  },
];

export function WhyScaleAIQ() {
  return (
    <section className="relative overflow-hidden py-16">
      {/* Dot pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="container relative mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Why Choose Us
          </span>
          <h2 className="mt-3 text-section-title font-heading">
            Why <span className="text-brand-gradient">ScaleAIQ</span>?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Intelligent solutions, limitless impact — a premium marketplace built for India&apos;s next generation of creators and learners.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${r.color} text-white shadow-md`}>
                <r.icon className="size-6" />
              </div>
              <h3 className="mt-5 text-base font-bold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
