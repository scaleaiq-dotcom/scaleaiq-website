import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600; // pricing rarely changes

export const metadata: Metadata = {
  title: "Pricing — ScaleAIQ",
  description: "Simple, transparent pricing. Choose the plan that's right for you.",
};

interface Plan {
  id: string; name: string; price: number; interval: "month" | "year";
  features: string[]; active: boolean; popular: boolean; order?: number;
}

async function getPlans(): Promise<Plan[]> {
  try {
    const snap = await adminDb.collection("plans").where("active", "==", true).get();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Plan))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch { return []; }
}

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="size-3.5" /> Pricing
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Start for free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {plans.length === 0 ? (
          /* Fallback when no plans in Firestore */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: "Free", price: 0, interval: "month", popular: false,
                features: ["Access to free products", "Basic downloads", "Community access", "Email support"],
              },
              {
                name: "Pro", price: 299, interval: "month", popular: true,
                features: ["Everything in Free", "Unlimited downloads", "Premium AI tools", "Prompt library access", "Priority support", "Early access to new products"],
              },
              {
                name: "Team", price: 999, interval: "month", popular: false,
                features: ["Everything in Pro", "Up to 5 team members", "Team dashboard", "Bulk licenses", "Dedicated account manager", "Custom integrations"],
              },
            ].map(plan => <PlanCard key={plan.name} plan={plan as Plan & { id: string }} />)}
          </div>
        ) : (
          <div className={`grid gap-8 mx-auto max-w-5xl ${plans.length === 1 ? "max-w-sm" : plans.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        )}

        {/* Trust section */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All plans include</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Instant access", "Secure payments", "Lifetime updates", "Money-back guarantee"].map(item => (
              <div key={item} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center text-sm font-medium">
                <Check className="size-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mx-auto mt-16 max-w-lg rounded-2xl border bg-card p-8 text-center">
          <p className="font-heading text-lg font-bold">Have questions about pricing?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check our FAQ or reach out — we're happy to help you pick the right plan.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/faq"
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
              View FAQ
            </Link>
            <a href="mailto:support@scaleaiq.in"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function PlanCard({ plan }: { plan: Plan & { id?: string } }) {
  return (
    <div className={`relative flex flex-col rounded-2xl border bg-card p-6 transition-all hover:shadow-md ${plan.popular ? "border-primary ring-1 ring-primary/20 shadow-sm" : ""}`}>
      {plan.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow">
          <Star className="size-2.5" /> Most Popular
        </span>
      )}

      <div>
        <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-1.5">
          {plan.price === 0 ? (
            <span className="font-heading text-4xl font-extrabold text-emerald-600">Free</span>
          ) : (
            <>
              <span className="font-heading text-4xl font-extrabold">₹{plan.price.toLocaleString("en-IN")}</span>
              <span className="text-sm text-muted-foreground">/{plan.interval}</span>
            </>
          )}
        </div>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <Link href="/sign-up"
        className={`mt-6 flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-95 ${
          plan.popular
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        }`}>
        {plan.price === 0 ? "Get started free" : `Start with ${plan.name}`}
      </Link>
    </div>
  );
}
