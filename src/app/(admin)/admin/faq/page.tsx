"use client";

import * as React from "react";
import { Plus, X, Edit2, Trash2, HelpCircle, GripVertical, ChevronDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string; question: string; answer: string;
  category: string; order: number; published: boolean;
}

const CATEGORIES = ["General", "Products", "Payments", "Downloads", "Workshops", "Account", "Technical"];

const BLANK: Omit<FAQ, "id" | "order"> = {
  question: "", answer: "", category: "General", published: true,
};

export default function FAQPage() {
  const [faqs, setFaqs]       = React.useState<FAQ[]>([]);
  const [modal, setModal]     = React.useState<FAQ | null>(null);
  const [isNew, setIsNew]     = React.useState(false);
  const [deleteId, setDelete] = React.useState<string | null>(null);
  const [search, setSearch]   = React.useState("");
  const [catFilter, setCat]   = React.useState("All");
  const [expanded, setExp]    = React.useState<string | null>(null);

  function openNew() {
    setIsNew(true);
    setModal({ id: crypto.randomUUID(), order: faqs.length + 1, ...BLANK });
  }

  function openEdit(f: FAQ) { setIsNew(false); setModal({ ...f }); }

  const [loading, setLoading] = React.useState(true);
  const [saving,  setSaving]  = React.useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/faq").catch(() => null);
    if (res?.ok) { const d = await res.json(); setFaqs(d.faqs ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  async function save() {
    if (!modal?.question.trim() || !modal.answer.trim()) return;
    setSaving(true);
    if (isNew) {
      await fetch("/api/admin/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modal) });
    } else {
      await fetch(`/api/admin/faq/${modal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modal) });
    }
    setModal(null);
    await load();
    setSaving(false);
  }

  async function remove() {
    await fetch(`/api/admin/faq/${deleteId}`, { method: "DELETE" });
    setDelete(null);
    await load();
  }

  const allCats = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];
  const filtered = faqs.filter(f => {
    const matchCat = catFilter === "All" || f.category === catFilter;
    const matchSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">FAQ</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {faqs.length} questions · {faqs.filter(f => f.published).length} published
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-48 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search FAQs…" />
          </div>
          <button onClick={openNew}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {allCats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={cn("cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
              catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {c}
          </button>
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-16 text-center">
          <HelpCircle className="size-12 text-muted-foreground/20" />
          <div>
            <p className="font-medium text-muted-foreground">
              {search || catFilter !== "All" ? "No matching FAQs" : "No FAQs yet"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {!search && catFilter === "All" && "Add frequently asked questions to help your customers."}
            </p>
          </div>
          {!search && catFilter === "All" && (
            <button onClick={openNew}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
              + Add First Question
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {filtered.map(f => (
            <div key={f.id} className="overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/30">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/40" />
                <button
                  onClick={() => setExp(expanded === f.id ? null : f.id)}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-left">
                  <span className="flex-1 text-sm font-medium">{f.question}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    f.published ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    {f.published ? "Published" : "Draft"}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {f.category}
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded === f.id && "rotate-180")} />
                </button>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(f)}
                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95">
                    <Edit2 className="size-3.5" />
                  </button>
                  <button onClick={() => setDelete(f.id)}
                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              {expanded === f.id && (
                <div className="border-t bg-muted/30 px-11 py-4 text-sm text-muted-foreground leading-relaxed">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{isNew ? "Add Question" : "Edit Question"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Question <span className="text-rose-500">*</span></label>
                <input value={modal.question} onChange={e => setModal({ ...modal, question: e.target.value })}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. How do I download a product?" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Answer <span className="text-rose-500">*</span></label>
                <textarea value={modal.answer} onChange={e => setModal({ ...modal, answer: e.target.value })} rows={5}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Write a clear, helpful answer…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Category</label>
                  <select value={modal.category} onChange={e => setModal({ ...modal, category: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <select value={modal.published ? "published" : "draft"}
                    onChange={e => setModal({ ...modal, published: e.target.value === "published" })}
                    className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setModal(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={save} disabled={saving || !modal.question.trim() || !modal.answer.trim()}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {isNew ? "Add Question" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDelete(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl">
            <h2 className="font-heading text-lg font-bold">Delete FAQ?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This question will be removed from your FAQ page.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDelete(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={remove}
                className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
