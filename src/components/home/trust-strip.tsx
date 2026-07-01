import { Gift, ShoppingBag, Crown, ShieldCheck, Zap, RefreshCw, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; sub: string }[] = [
  { icon: Gift,        title: "Free Resources",    sub: "Lots of free valuable resources" },
  { icon: ShoppingBag, title: "One-time Purchase", sub: "Pay once, use forever" },
  { icon: Crown,       title: "Subscription Plans", sub: "Unlock premium content" },
  { icon: ShieldCheck, title: "Secure Payment",    sub: "100% secure and safe" },
  { icon: Zap,         title: "Instant Access",    sub: "Access immediately after purchase" },
  { icon: RefreshCw,   title: "Regular Updates",   sub: "New content added every week" },
];

export function TrustStrip() {
  return (
    <section className="container mx-auto px-4 pt-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-3 sm:grid-cols-3 sm:gap-3 sm:p-4 lg:grid-cols-6">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">{title}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
