"use client";

import * as React from "react";
import { Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small share dropdown for admin: WhatsApp / X / Facebook / copy link. */
export function ShareMenu({ title, url, className }: { title: string; url: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const text = encodeURIComponent(`${title} — ${url}`);
  const encUrl = encodeURIComponent(url);
  const links = [
    { label: "WhatsApp", href: `https://api.whatsapp.com/send?text=${text}`, color: "text-[#25D366]" },
    { label: "X (Twitter)", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encUrl}`, color: "text-foreground" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, color: "text-[#1877F2]" },
  ];

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1200);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`Share ${title}`}
        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Share2 className="size-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border bg-card py-1 shadow-xl">
          {links.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-accent">
              <span className={cn("text-sm", l.color)}>●</span> {l.label}
            </a>
          ))}
          <button onClick={copy}
            className="flex w-full items-center gap-2 border-t px-3 py-2 text-xs font-medium transition-colors hover:bg-accent">
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
