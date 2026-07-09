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

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function SocialProofToast() {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [item, setItem] = React.useState<{ name: string; city: string; title: string; action: string } | null>(null);
  const [seed, setSeed] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = React.useCallback((s: number) => {
    const p = pick(PRODUCTS, s);
    setItem({
      name: pick(NAMES, s + 3),
      city: pick(CITIES, s + 7),
      title: p.title,
      action: p.action,
    });
    setVisible(true);
    // Auto-hide after 5s
    timerRef.current = setTimeout(() => setVisible(false), 5000);
  }, []);

  React.useEffect(() => {
    // First show: delay 8s so page load is settled
    const initial = setTimeout(() => {
      if (!dismissed) show(0);
    }, 8000);

    return () => clearTimeout(initial);
  }, [show, dismissed]);

  // Cycle every 35s
  React.useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setSeed(s => {
        const next = s + 1;
        show(next);
        return next;
      });
    }, 35000);
    return () => clearInterval(interval);
  }, [show, dismissed]);

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
