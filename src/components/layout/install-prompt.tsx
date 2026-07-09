"use client";

import * as React from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Platform detection ────────────────────────────────────────────────────────
function useInstallState() {
  const [platform, setPlatform] = React.useState<"android" | "ios" | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);

  React.useEffect(() => {
    // Already installed as PWA — don't show prompt
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isAndroidChrome = /Android/.test(ua) && /Chrome/.test(ua) && !/EdgA|OPR/.test(ua);

    if (isIOS) setPlatform("ios");
    else if (isAndroidChrome) setPlatform("android");

    // Android: capture the native install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return { platform, isInstalled, deferredPrompt };
}

// ── Main component ────────────────────────────────────────────────────────────
export function InstallPrompt() {
  const { platform, isInstalled, deferredPrompt } = useInstallState();
  const [dismissed, setDismissed] = React.useState(false);
  const [showIOS, setShowIOS] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  // Delay appearance so it doesn't fight with page load
  React.useEffect(() => {
    if (isInstalled || dismissed) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [isInstalled, dismissed]);

  function dismiss() {
    setDismissed(true);
    setVisible(false);
    setShowIOS(false);
    // Remember for 3 days
    localStorage.setItem("pwa-dismissed", String(Date.now()));
  }

  // Check if dismissed recently
  React.useEffect(() => {
    const ts = localStorage.getItem("pwa-dismissed");
    if (ts && Date.now() - Number(ts) < 3 * 24 * 60 * 60 * 1000) setDismissed(true);
  }, []);

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") dismiss();
  }

  if (isInstalled || dismissed || !platform) return null;

  return (
    <>
      {/* ── Android install banner ── */}
      {platform === "android" && (
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-2xl transition-transform duration-500 safe-bottom",
          visible ? "translate-y-0" : "translate-y-full"
        )}>
          <div className="container mx-auto flex items-center gap-3 px-4 py-3">
            {/* App icon */}
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-gradient shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="ScaleAIQ" className="size-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Install ScaleAIQ App</p>
              <p className="text-xs text-muted-foreground">Fast access · Works offline · No browser needed</p>
            </div>

            <button
              onClick={handleAndroidInstall}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow"
            >
              <Download className="size-3.5" /> Install
            </button>

            <button onClick={dismiss} aria-label="Close" className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── iOS install banner ── */}
      {platform === "ios" && (
        <>
          {/* Trigger banner */}
          <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-2xl transition-transform duration-500",
            visible && !showIOS ? "translate-y-0" : "translate-y-full"
          )}>
            <div className="container mx-auto flex items-center gap-3 px-4 py-3">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-gradient shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-192.png" alt="ScaleAIQ" className="size-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Add ScaleAIQ to Home Screen</p>
                <p className="text-xs text-muted-foreground">Tap to see how — takes 5 seconds</p>
              </div>
              <button
                onClick={() => setShowIOS(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow"
              >
                <Plus className="size-3.5" /> Add
              </button>
              <button onClick={dismiss} aria-label="Close" className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* iOS step-by-step modal */}
          {showIOS && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-t-3xl border bg-card p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold">Add to Home Screen</h2>
                    <p className="text-xs text-muted-foreground">3 quick steps on Safari</p>
                  </div>
                  <button onClick={dismiss} className="rounded-xl p-1.5 text-muted-foreground hover:bg-accent">
                    <X className="size-4" />
                  </button>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4 rounded-2xl border bg-muted/40 p-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                      <Share className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Step 1 — Tap Share</p>
                      <p className="text-xs text-muted-foreground">
                        Tap the <span className="font-bold">Share</span> button (box with arrow ↑) at the bottom of Safari
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-4 rounded-2xl border bg-muted/40 p-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                      <Plus className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Step 2 — Add to Home Screen</p>
                      <p className="text-xs text-muted-foreground">
                        Scroll down in the menu and tap <span className="font-bold">"Add to Home Screen"</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-4 rounded-2xl border bg-muted/40 p-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gradient">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/icon-192.png" alt="" className="size-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Step 3 — Tap Add</p>
                      <p className="text-xs text-muted-foreground">
                        Tap <span className="font-bold">"Add"</span> in the top-right. ScaleAIQ icon appears on your home screen!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Arrow pointing down to Safari bar */}
                <div className="mt-5 flex flex-col items-center gap-1 text-muted-foreground">
                  <p className="text-xs">Look for this icon in Safari ↓</p>
                  <div className="flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2">
                    <Share className="size-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">Share</span>
                  </div>
                </div>

                <button
                  onClick={dismiss}
                  className="mt-4 w-full rounded-2xl bg-brand-gradient py-3 text-sm font-bold text-white"
                >
                  Got it — I&apos;ll add it now!
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
