"use client";

import * as React from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ { id: string; question: string; answer: string; category: string; }

export function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [open,      setOpen]   = React.useState<string | null>(null);
  const [search,    setSearch] = React.useState("");
  const [catFilter, setCat]    = React.useState("All");

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];

  const filtered = faqs.filter(f => {
    const matchCat = catFilter === "All" || f.category === catFilter;
    const matchSearch = !search
      || f.question.toLowerCase().includes(search.toLowerCase())
      || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = categories.filter(c => c !== "All").reduce<Record<string, FAQ[]>>((acc, c) => {
    const items = filtered.filter(f => f.category === c);
    if (items.length) acc[c] = items;
    return acc;
  }, {});

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" /> Help Center
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything you need to know about ScaleAIQ products, payments, and downloads.
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-6 max-w-md">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="h-12 w-full rounded-xl border bg-card pl-11 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                catFilter === c ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              )}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <HelpCircle className="size-12 text-muted-foreground/20" />
            <p className="font-medium text-muted-foreground">
              {search ? `No results for "${search}"` : "No FAQs available yet."}
            </p>
          </div>
        ) : catFilter !== "All" ? (
          /* Single category view */
          <div className="mx-auto max-w-2xl space-y-2">
            {filtered.map(faq => <FAQItem key={faq.id} faq={faq} open={open} setOpen={setOpen} />)}
          </div>
        ) : (
          /* Grouped by category */
          <div className="mx-auto max-w-2xl space-y-10">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="mb-4 font-heading text-lg font-bold">{cat}</h2>
                <div className="space-y-2">
                  {items.map(faq => <FAQItem key={faq.id} faq={faq} open={open} setOpen={setOpen} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mx-auto mt-16 max-w-lg rounded-2xl border bg-card p-8 text-center">
          <HelpCircle className="mx-auto size-10 text-primary/60" />
          <h2 className="mt-3 font-heading text-lg font-bold">Still have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a href="mailto:support@scaleaiq.in"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}

function FAQItem({ faq, open, setOpen }: { faq: FAQ; open: string | null; setOpen: (id: string | null) => void }) {
  const isOpen = open === faq.id;
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card transition-all", isOpen && "border-primary/30 shadow-sm")}>
      <button
        onClick={() => setOpen(isOpen ? null : faq.id)}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left">
        <span className="flex-1 text-sm font-semibold">{faq.question}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="border-t bg-muted/20 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          {faq.answer}
        </div>
      )}
    </div>
  );
}
