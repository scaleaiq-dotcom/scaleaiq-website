"use client";

import * as React from "react";
import { ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAMES = [
  "Rahul S.", "Priya M.", "Ankit P.", "Neha R.", "Vivek K.",
  "Pooja D.", "Amit T.", "Sneha V.", "Rohan J.", "Kavita B.",
  "Arjun L.", "Meera N.", "Deepak C.", "Ritu A.", "Sanjay G.",
  "Anjali F.", "Nikhil H.", "Divya W.", "Karan E.", "Sunita Q.",
];

const CITIES = [
  "Surat", "Ahmedabad", "Mumbai", "Delhi", "Pune",
  "Bengaluru", "Jaipur", "Vadodara", "Rajkot", "Hyderabad",
  "Nashik", "Indore", "Bhopal", "Lucknow", "Chandigarh",
];

const PRODUCTS = [
  { title: "Webseekho Pro", action: "purchased" },
  { title: "25 Premium AI Prompts for Students", action: "downloaded" },
  { title: "AI (Artificial Intelligence) in Gujarati", action: "downloaded" },
  { title: "The AI Career Blueprint", action: "purchased" },
  { title: "Webseekho Pro", action: "purchased" },
  { title: "25 Premium AI Prompts for Students", action: "downloaded" },
  { title: "AI Career Blueprint", action: "purchased" },
];

// Fisher-Yates shuffle — returns a new shuffled array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SocialProofToast() {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [item, setItem] = React.useState<{ name: string; city: string; title: string; action: string } | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Each list is shuffled independently — names/cities/products rotate at
  // different rates so the same combination never repeats within a session.
  const namesRef    = React.useRef<string[]>([]);
  const citiesRef   = React.useRef<string[]>([]);
  const productsRef = React.useRef<typeof PRODUCTS>([]);
  const idxRef      = React.useRef({ name: 0, city: 0, product: 0 });

  React.useEffect(() => {
    namesRef.current    = shuffle(NAMES);
    citiesRef.current   = shuffle(CITIES);
    productsRef.current = shuffle(PRODUCTS);
  }, []);

  const next = React.useCallback(() => {
    const idx = idxRef.current;
    const name    = namesRef.current[idx.name    % namesRef.current.length];
    const city    = citiesRef.current[idx.city   % citiesRef.current.length];
    const product = productsRef.current[idx.product % productsRef.current.length];

    // Advance each index independently to avoid same-pair repeats
    idx.name    += 1;
    idx.city    += 3; // prime-like step — city changes faster than name
    idx.product += 2;

    // Re-shuffle each list once exhausted so the cycle feels fresh
    if (idx.name    >= namesRef.current.length)    { namesRef.current    = shuffle(NAMES);    idx.name = 0; }
    if (idx.city    >= citiesRef.current.length)   { citiesRef.current   = shuffle(CITIES);   idx.city = 0; }
    if (idx.product >= productsRef.current.length) { productsRef.current = shuffle(PRODUCTS); idx.product = 0; }

    setItem({ name, city, title: product.title, action: product.action });
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 5000);
  }, []);

  // First show after 8s
  React.useEffect(() => {
    const t = setTimeout(() => { if (!dismissed) next(); }, 8000);
    return () => clearTimeout(t);
  }, [next, dismissed]);

  // Then every 35s
  React.useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => { if (!dismissed) next(); }, 35000);
    return () => clearInterval(interval);
  }, [next, dismissed]);

  function dismiss() {
    setDismissed(true);
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  if (dismissed || !item) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-4 z-50 w-72 rounded-2xl border bg-card shadow-xl transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient">
          <ShoppingBag className="size-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {item.name} from {item.city}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
            Just <span className="font-medium text-foreground">{item.action}</span>{" "}
            <span className="font-semibold text-primary">{item.title}</span>
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/70">a few minutes ago</p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
