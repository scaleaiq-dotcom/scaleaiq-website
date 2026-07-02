import Link from "next/link";
import Image from "next/image";
import { Zap, ShieldCheck, Gift, RefreshCw } from "lucide-react";

const TRUST_POINTS = [
  { icon: Gift,        title: "Free resources to start",  desc: "Templates, prompts & guides at ₹0" },
  { icon: Zap,         title: "Instant access",           desc: "Downloads unlock the moment you claim or buy" },
  { icon: ShieldCheck, title: "Secure payments",          desc: "Razorpay protected — UPI, cards & netbanking" },
  { icon: RefreshCw,   title: "Lifetime re-downloads",    desc: "Everything stays in your library forever" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">

      {/* ── LEFT — branded panel (desktop only) ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,#0a0f1f_0%,#1e1060_55%,#7b3dff_120%)] p-10 text-white lg:flex">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[#00c8ff]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-[#d946ff]/15 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="relative size-9 overflow-hidden rounded-xl shadow-md ring-1 ring-white/20">
            <Image src="/brand/logo-mark.png" alt="ScaleAIQ" width={36} height={36} className="size-full object-cover" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight">
            Scale<span className="bg-gradient-to-r from-[#00c8ff] to-[#d946ff] bg-clip-text text-transparent">AIQ</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight">
            India&apos;s marketplace for AI tools, courses &amp; digital resources
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Learn faster, work smarter, and build bigger — with premium digital products at prices that make sense.
          </p>

          <div className="mt-8 space-y-4">
            {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4 text-[#00c8ff]" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          🔒 Secured by Firebase Authentication · We never share your data
        </p>
      </div>

      {/* ── RIGHT — the form ── */}
      <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background px-4 py-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(123,61,255,0.08),transparent_60%)]" />

        {/* Mobile brand header (left panel is hidden) */}
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="relative size-9 overflow-hidden rounded-xl shadow-md ring-1 ring-white/10">
            <Image src="/brand/logo-mark.png" alt="ScaleAIQ" width={36} height={36} className="size-full object-cover" />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight">
            Scale<span className="text-brand-gradient">AIQ</span>
          </span>
        </Link>

        {children}

        <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
          🔒 Secured by Firebase · Razorpay-protected payments
        </p>
      </div>
    </div>
  );
}
