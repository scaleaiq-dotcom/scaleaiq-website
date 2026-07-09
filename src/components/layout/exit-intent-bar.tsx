"use client";

import * as React from "react";
import Link from "next/link";
import { Gift, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Best free product to show — update slug/title here if you change your hero free product
const FREE_PRODUCT = {
  title: "AI (Artificial Intelligence) in Gujarati — FREE",
  slug: "ai-artificial-intelligence",
  cta: "Download Free →",
};

export function ExitIntentBar() {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const shownRef = React.useRef(false);

  function show() {
    if (shownRef.current || dismissed) return;
    shownRef.current = true;
    setVisible(true);
  }

  React.useEffect(() => {
    if (dismissed) return;

    // Mouse leaves toward top of viewport (back button / new tab area)
    function onMouseOut(e: MouseEvent) {
      if (e.clientY <= 10) show();
    }

    // Idle for 40s — user stopped engaging
    let idleTimer: ReturnType<typeof setTimeout> = setTimeout(show, 40000);
    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(show, 40000);
    }

    document.addEventListener("mouseleave", onMouseOut);
    document.addEventListener("mousemove", resetIdle);
    document.addEventListener("keydown", resetIdle);
    document.addEventListener("scroll", resetIdle);

    return () => {
      document.removeEventListener("mouseleave", onMouseOut);
      document.removeEventListener("mousemove", resetIdle);
      document.removeEventListener("keydown", resetIdle);
      document.removeEventListener("scroll", resetIdle);
      clearTimeout(idleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-card shadow-2xl transition-transform duration-500",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto flex items-center gap-4 px-4 py-3 sm:py-4">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500">
          <Gift className="size-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground sm:text-sm">
            Wait! Before you go — grab this for FREE 🎁
          </p>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            {FREE_PRODUCT.title}
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/product/${FREE_PRODUCT.slug}`}
          onClick={dismiss}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
        >
          {FREE_PRODUCT.cta} <ArrowRight className="size-3.5" />
        </Link>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
