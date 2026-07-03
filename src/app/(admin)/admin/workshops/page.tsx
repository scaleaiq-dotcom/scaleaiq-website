"use client";

import * as React from "react";
import {
  Plus, X, Edit2, Trash2, CalendarDays, Clock, Users,
  Video, Link as LinkIcon, Search, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Workshop {
  id: string; title: string; description: string;
  date: string; time: string; duration: string;
  seats: number; registered: number;
  price: number; isFree: boolean;
  meetingLink: string; platform: string;
  // Must match the public /workshops page: draft is hidden, recorded shows
  // under "On-Demand Recordings", cancelled is hidden.
  status: "draft" | "upcoming" | "live" | "recorded" | "cancelled";
  instructor: string; tags: string;
}

const BLANK: Omit<Workshop, "id" | "registered"> = {
  title: "", description: "", date: "", time: "", duration: "60",
  seats: 100, price: 0, isFree: true,
  meetingLink: "", platform: "Zoom",
  status: "upcoming", instructor: "", tags: "",
};

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  upcoming:  "bg-blue-500/10 text-blue-600",
  live:      "bg-emerald-500/10 text-emerald-600",
  recorded:  "bg-violet-500/10 text-violet-600",
  cancelled: "bg-rose-500/10 text-rose-600",
};

function timeAgo(dateStr: string, timeStr: string) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T${timeStr || "00:00"}`);
  const diff = d.getTime() - Date.now();
  if (diff < 0) return "Past";
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = React.useState<Workshop[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [modal, setModal]         = React.useState<Workshop | null>(null);
  const [isNew, setIsNew]         = React.useState(false);
  const [saving, setSaving]       = React.useState(false);
  const [deleteId, setDeleteId]   = React.useState<string | null>(null);
  const [search, setSearch]       = React.useState("");
  const [filter, setFilter]       = React.useState<"all" | Workshop["status"]>("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/workshops").catch(() => null);
    if (res?.ok) { const d = await res.json(); setWorkshops(d.workshops ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  function openNew() {
    setIsNew(true);
    setModal({ id: "", registered: 0, ...BLANK });
  }

  function openEdit(w: Workshop) {
    setIsNew(false);
    setModal({ ...w });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!modal?.title.trim() || !modal.date) return;
    setSaving(true);
    if (isNew) {
      await fetch("/api/admin/workshops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modal) });
    } else {
      await fetch(`/api/admin/workshops/${modal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(modal) });
    }
    setSaving(false);
    setModal(null);
    await load();
  }

  async function remove() {
    if (!deleteId) return;
    await fetch(`/api/admin/workshops/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  function upd<K extends keyof Workshop>(k: K, v: Workshop[K]) {
    setModal(p => p ? { ...p, [k]: v } : p);
  }

  const filtered = workshops.filter(w => {
    const matchFilter = filter === "all" || w.status === filter;
    const matchSearch = !search || w.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Workshops</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {workshops.length} total · {workshops.filter(w => w.status === "upcoming").length} upcoming
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-48 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search workshops…" />
          </div>
          <button onClick={openNew}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> Create Workshop
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {(["all", "draft", "upcoming", "live", "recorded", "cancelled"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {s === "all" ? `All (${workshops.length})` : `${s} (${workshops.filter(w => w.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-16 text-center">
          <CalendarDays className="size-12 text-muted-foreground/20" />
          <div>
            <p className="font-medium text-muted-foreground">
              {search || filter !== "all" ? "No matching workshops" : "No workshops yet"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {!search && filter === "all" && "Create your first live workshop or webinar."}
            </p>
          </div>
          {!search && filter === "all" && (
            <button onClick={openNew}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
              + Create Workshop
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(w => (
            <div key={w.id}
              className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">

              {/* Status + countdown */}
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", STATUS_STYLES[w.status])}>
                  {w.status}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(w.date, w.time)}</span>
              </div>

              <h3 className="font-heading text-sm font-bold leading-tight">{w.title}</h3>
              {w.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{w.description}</p>
              )}

              {/* Meta */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {w.date ? new Date(w.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  {w.time && ` · ${w.time}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" />
                  {w.duration} min · {w.platform}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-3.5 shrink-0" />
                  {w.registered} / {w.seats} registered
                  <div className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((w.registered / w.seats) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {w.isFree ? <span className="text-emerald-600">Free</span> : <span>₹{w.price.toLocaleString("en-IN")}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t pt-3">
                {w.meetingLink && (
                  <a href={w.meetingLink} target="_blank" rel="noreferrer"
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border bg-primary/5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-95">
                    <Video className="size-3.5" /> Join
                  </a>
                )}
                <button onClick={() => openEdit(w)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-colors hover:bg-accent active:scale-95">
                  <Edit2 className="size-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(w.id)}
                  className="cursor-pointer rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-500 transition-colors hover:bg-rose-50 active:scale-95">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ─────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{isNew ? "Create Workshop" : "Edit Workshop"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={save} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                <Field label="Workshop Title *">
                  <input value={modal.title} onChange={e => upd("title", e.target.value)} required
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. AI for Students — Live Workshop" />
                </Field>

                <Field label="Description">
                  <textarea value={modal.description} onChange={e => upd("description", e.target.value)} rows={3}
                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="What will participants learn?" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date *">
                    <input type="date" value={modal.date} onChange={e => upd("date", e.target.value)} required
                      className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </Field>
                  <Field label="Time">
                    <input type="time" value={modal.time} onChange={e => upd("time", e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Duration (min)">
                    <input type="number" value={modal.duration} onChange={e => upd("duration", e.target.value)} min={15}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </Field>
                  <Field label="Total Seats">
                    <input type="number" value={modal.seats} onChange={e => upd("seats", Number(e.target.value))} min={1}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  </Field>
                  <Field label="Platform">
                    <select value={modal.platform} onChange={e => upd("platform", e.target.value)}
                      className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                      <option>Zoom</option>
                      <option>Google Meet</option>
                      <option>YouTube Live</option>
                      <option>Jitsi</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>

                <Field label="Meeting / Join Link">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={modal.meetingLink} onChange={e => upd("meetingLink", e.target.value)}
                      className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="https://zoom.us/j/..." />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Instructor Name">
                    <input value={modal.instructor} onChange={e => upd("instructor", e.target.value)}
                      className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Your name" />
                  </Field>
                  <Field label="Status">
                    <select value={modal.status} onChange={e => upd("status", e.target.value as Workshop["status"])}
                      className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                      <option value="draft">Draft (hidden from site)</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live Now</option>
                      <option value="recorded">Recorded (on-demand)</option>
                      <option value="cancelled">Cancelled (hidden from site)</option>
                    </select>
                  </Field>
                </div>

                {/* Pricing */}
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Pricing</p>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" checked={modal.isFree} onChange={e => upd("isFree", e.target.checked)} />
                      Free Workshop
                    </label>
                  </div>
                  {!modal.isFree && (
                    <Field label="Price (₹)">
                      <input type="number" value={modal.price} onChange={e => upd("price", Number(e.target.value))} min={0}
                        className="h-9 w-40 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </Field>
                  )}
                </div>

                <Field label="Tags" hint="Comma-separated: AI, Students, Free">
                  <input value={modal.tags} onChange={e => upd("tags", e.target.value)}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="AI, Students, Productivity" />
                </Field>
              </div>

              <div className="flex gap-3 border-t px-6 py-4">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !modal.title.trim() || !modal.date}
                  className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                  {saving ? <Loader2 className="mx-auto size-4 animate-spin" /> : isNew ? "Create Workshop" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl">
            <h2 className="font-heading text-lg font-bold">Delete Workshop?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This will permanently remove the workshop and all its details.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={remove}
                className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
