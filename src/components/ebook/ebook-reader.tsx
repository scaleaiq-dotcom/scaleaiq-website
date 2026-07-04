"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, Search, List, Type, Loader2, Sun } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Load JSZip + epub.js once from CDN (epub.js needs JSZip as a global).
let scriptsPromise: Promise<void> | null = null;
function loadEpubScripts(): Promise<void> {
  if (scriptsPromise) return scriptsPromise;
  scriptsPromise = new Promise((resolve, reject) => {
    if ((window as any).ePub) return resolve();
    function add(src: string) {
      return new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = src; s.async = true;
        s.onload = () => res();
        s.onerror = () => rej(new Error("Failed to load " + src));
        document.body.appendChild(s);
      });
    }
    add("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js")
      .then(() => add("https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js"))
      .then(() => resolve())
      .catch(reject);
  });
  return scriptsPromise;
}

type Theme = "paper" | "sepia" | "dark";
const THEMES: Record<Theme, { bg: string; fg: string; shell: string; muted: string }> = {
  paper: { bg: "#fdfcf9", fg: "#1f2430", shell: "#ffffff", muted: "#5a6172" },
  sepia: { bg: "#f4ecd8", fg: "#4a3f2e", shell: "#fbf5e6", muted: "#7a6a4f" },
  dark:  { bg: "#16171c", fg: "#e8e8ee", shell: "#1f2129", muted: "#a2a6b3" },
};

interface TocItem { label: string; href: string; }
interface Hit { cfi: string; excerpt: string; }

export function EbookReader({ url, title, label, onClose }: {
  url: string; title: string; label?: string; onClose: () => void;
}) {
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const bookRef = React.useRef<any>(null);
  const rendRef = React.useRef<any>(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [pct, setPct] = React.useState(0);
  const [theme, setTheme] = React.useState<Theme>("paper");
  const [fontPct, setFontPct] = React.useState(100);
  const [toc, setToc] = React.useState<TocItem[]>([]);
  const [panel, setPanel] = React.useState<"none" | "toc" | "search">("none");
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [searching, setSearching] = React.useState(false);

  const t = THEMES[theme];

  // Build the book + rendition
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadEpubScripts();
        if (cancelled || !viewerRef.current) return;
        const ePub = (window as any).ePub;
        // Force archive mode — Firebase-style URLs don't end in ".epub" so
        // epub.js can otherwise misdetect the type and fail.
        const book = ePub(url, { openAs: "epub" });
        bookRef.current = book;
        // Don't hang forever if the file can't be fetched (CORS, 403, offline).
        await Promise.race([
          book.opened,
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 20000)),
        ]);
        if (cancelled) return;
        const rendition = book.renderTo(viewerRef.current, {
          width: "100%", height: "100%", flow: "paginated", spread: "none", allowScriptedContent: true,
        });
        rendRef.current = rendition;
        await rendition.display();
        if (cancelled) return;

        rendition.on("relocated", (loc: any) => {
          try {
            const p = book.locations.percentageFromCfi(loc.start.cfi);
            if (typeof p === "number") setPct(Math.round(p * 100));
          } catch {}
        });

        book.loaded.navigation.then((nav: any) => {
          const items: TocItem[] = (nav.toc ?? []).map((i: any) => ({ label: i.label?.trim() ?? "", href: i.href }));
          if (!cancelled) setToc(items);
        }).catch(() => {});

        book.ready.then(() => book.locations.generate(1200)).catch(() => {});
        setLoading(false);
      } catch (e) {
        console.error("EbookReader open failed:", e);
        if (!cancelled) {
          setError("Could not open this ebook. The file may not be a valid EPUB, or it isn't publicly readable yet.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      try { rendRef.current?.destroy?.(); } catch {}
      try { bookRef.current?.destroy?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Apply theme + font size to the rendered content
  React.useEffect(() => {
    const r = rendRef.current;
    if (!r) return;
    try {
      r.themes.override("color", t.fg, true);
      r.themes.override("background", t.bg, true);
      r.themes.fontSize(fontPct + "%");
    } catch {}
  }, [theme, fontPct, t.fg, t.bg, loading]);

  const next = React.useCallback(() => rendRef.current?.next(), []);
  const prev = React.useCallback(() => rendRef.current?.prev(), []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  function jump(href: string) { rendRef.current?.display(href); setPanel("none"); }

  async function runSearch() {
    const book = bookRef.current;
    const q = query.trim();
    if (!book || q.length < 2) { setHits([]); return; }
    setSearching(true);
    try {
      const results = await Promise.all(
        book.spine.spineItems.map((item: any) =>
          item.load(book.load.bind(book))
            .then(() => { const r = item.find(q); item.unload(); return r; })
            .catch(() => [])
        )
      );
      const flat: Hit[] = ([] as any[]).concat(...results).slice(0, 40)
        .map((r: any) => ({ cfi: r.cfi, excerpt: r.excerpt }));
      setHits(flat);
    } catch { setHits([]); }
    finally { setSearching(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: t.bg, color: t.fg }}>
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: t.bg === "#16171c" ? "#2c2e37" : "#00000015", background: t.shell }}>
        <button onClick={onClose} aria-label="Close reader" className="flex size-9 items-center justify-center rounded-lg hover:opacity-70"><X className="size-5" /></button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          {label && <p className="text-[10px]" style={{ color: t.muted }}>{label}</p>}
        </div>
        <IconBtn onClick={() => setPanel(panel === "toc" ? "none" : "toc")} active={panel === "toc"} t={t}><List className="size-5" /></IconBtn>
        <IconBtn onClick={() => setPanel(panel === "search" ? "none" : "search")} active={panel === "search"} t={t}><Search className="size-5" /></IconBtn>
        <IconBtn onClick={() => setFontPct(p => (p >= 160 ? 90 : p + 15))} t={t}><Type className="size-5" /></IconBtn>
        <IconBtn onClick={() => setTheme(theme === "paper" ? "sepia" : theme === "sepia" ? "dark" : "paper")} t={t}><Sun className="size-5" /></IconBtn>
      </div>

      {/* Stage */}
      <div className="relative flex-1 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3" style={{ color: t.muted }}>
            <Loader2 className="size-7 animate-spin" /> <span className="text-sm">Opening your book…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-sm">{error}</p>
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Close</button>
          </div>
        )}
        <div ref={viewerRef} className="mx-auto h-full w-full max-w-3xl px-2" />

        {/* Tap zones for page turn */}
        {!loading && !error && (
          <>
            <button aria-label="Previous page" onClick={prev} className="absolute left-0 top-0 h-full w-14 md:w-20" />
            <button aria-label="Next page" onClick={next} className="absolute right-0 top-0 h-full w-14 md:w-20" />
          </>
        )}

        {/* TOC / Search panel */}
        {panel !== "none" && (
          <div className="absolute inset-0 z-20 flex justify-end" onClick={() => setPanel("none")}>
            <div className="h-full w-full max-w-sm overflow-y-auto border-l p-4" style={{ background: t.shell, borderColor: "#00000015" }} onClick={e => e.stopPropagation()}>
              {panel === "toc" ? (
                <>
                  <p className="mb-3 text-sm font-bold">Contents</p>
                  {toc.length === 0 ? <p className="text-xs" style={{ color: t.muted }}>No chapters found.</p> : toc.map((i, k) => (
                    <button key={k} onClick={() => jump(i.href)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:opacity-70">{i.label || `Section ${k + 1}`}</button>
                  ))}
                </>
              ) : (
                <>
                  <p className="mb-3 text-sm font-bold">Search the book</p>
                  <div className="flex gap-2">
                    <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()}
                      placeholder="Type a word or phrase…" autoFocus
                      className="h-9 flex-1 rounded-lg border px-3 text-sm outline-none" style={{ background: t.bg, borderColor: "#00000020", color: t.fg }} />
                    <button onClick={runSearch} className="rounded-lg px-3 text-sm font-semibold text-white" style={{ background: "#7b3dff" }}>Go</button>
                  </div>
                  {searching && <p className="mt-3 flex items-center gap-2 text-xs" style={{ color: t.muted }}><Loader2 className="size-3.5 animate-spin" /> Searching…</p>}
                  {!searching && query && hits.length === 0 && <p className="mt-3 text-xs" style={{ color: t.muted }}>No matches.</p>}
                  <div className="mt-3 space-y-2">
                    {hits.map((h, k) => (
                      <button key={k} onClick={() => { rendRef.current?.display(h.cfi); setPanel("none"); }}
                        className="block w-full rounded-lg border px-3 py-2 text-left text-xs leading-relaxed hover:opacity-80" style={{ borderColor: "#00000015" }}>
                        …{h.excerpt.trim()}…
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-3 border-t px-4 py-2.5" style={{ borderColor: t.bg === "#16171c" ? "#2c2e37" : "#00000015", background: t.shell }}>
        <button onClick={prev} className="flex items-center gap-1 text-sm font-medium hover:opacity-70"><ChevronLeft className="size-4" /> Prev</button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: t.bg === "#16171c" ? "#2c2e37" : "#00000012" }}>
          <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: "#7b3dff" }} />
        </div>
        <span className="min-w-[36px] text-center text-xs font-semibold" style={{ color: t.muted }}>{pct}%</span>
        <button onClick={next} className="flex items-center gap-1 text-sm font-medium hover:opacity-70">Next <ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, active, t }: { children: React.ReactNode; onClick: () => void; active?: boolean; t: { fg: string } }) {
  return (
    <button onClick={onClick} className="flex size-9 items-center justify-center rounded-lg transition-colors hover:opacity-70"
      style={active ? { background: "#7b3dff", color: "#fff" } : { color: t.fg }}>
      {children}
    </button>
  );
}
