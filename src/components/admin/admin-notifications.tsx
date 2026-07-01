"use client";

import * as React from "react";
import { Send, Bell, Users, Megaphone, Loader2, Trash2 } from "lucide-react";

type Target = "all" | "buyers" | "free_users" | "specific";
type Channel = "push" | "email" | "both";

interface HistoryItem {
  id: string; title: string; body: string;
  target: string; channel: string; sentAt: string;
}

const templates = [
  { label: "New Product Launch", title: "🚀 New product just dropped!", body: "Check out our latest addition to the marketplace." },
  { label: "Flash Sale",         title: "⚡ 24-hour Flash Sale — Up to 50% OFF!", body: "Don't miss out. Sale ends in 24 hours." },
  { label: "Free Resource",      title: "🎁 New free resource available", body: "We've added a free resource. Grab it before it's gone!" },
  { label: "Reminder",           title: "👋 You left something in your cart", body: "Complete your purchase and unlock instant access." },
];

export function AdminNotifications() {
  const [form,    setForm]    = React.useState({ title: "", body: "", target: "all" as Target, channel: "both" as Channel, specificEmail: "" });
  const [sending, setSending] = React.useState(false);
  const [sent,    setSent]    = React.useState(false);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [hLoading, setHLoading] = React.useState(true);

  async function loadHistory() {
    setHLoading(true);
    const res = await fetch("/api/admin/notifications").catch(() => null);
    if (res?.ok) { const d = await res.json(); setHistory(d.notifications ?? []); }
    setHLoading(false);
  }

  React.useEffect(() => { loadHistory(); }, []);

  async function handleSend() {
    if (!form.title || !form.body) return;
    setSending(true);
    await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, body: form.body, target: form.target, channel: form.channel, specificEmail: form.specificEmail }),
    }).catch(() => null);
    setSent(true);
    setSending(false);
    setForm(p => ({ ...p, title: "", body: "" }));
    await loadHistory();
    setTimeout(() => setSent(false), 3000);
  }

  async function deleteNotification(id: string) {
    await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" }).catch(() => null);
    setHistory(h => h.filter(n => n.id !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Compose */}
      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Compose Notification</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title <span className="text-rose-500">*</span></label>
              <input placeholder="Notification title…" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message <span className="text-rose-500">*</span></label>
              <textarea rows={4} placeholder="Notification body text…" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="text-xs text-muted-foreground">{form.body.length}/200 characters</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Send To</label>
                <select value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value as Target }))}
                  className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                  <option value="all">All Users</option>
                  <option value="buyers">Buyers Only</option>
                  <option value="free_users">Free Users</option>
                  <option value="specific">Specific Email</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Channel</label>
                <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value as Channel }))}
                  className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                  <option value="both">Push + Email</option>
                  <option value="push">Push Only</option>
                  <option value="email">Email Only</option>
                </select>
              </div>
            </div>

            {form.target === "specific" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" placeholder="user@example.com" value={form.specificEmail} onChange={e => setForm(p => ({ ...p, specificEmail: e.target.value }))}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}

            {/* Preview */}
            {(form.title || form.body) && (
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
                <div className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 ring-border">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Bell className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{form.title || "Notification title"}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{form.body || "Notification body text"}</p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSend} disabled={sending || !form.title || !form.body}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
              {sending ? <Loader2 className="size-4 animate-spin" /> : sent ? <span>✓ Sent!</span> : <><Send className="size-4" /> Send Notification</>}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Notification History {history.length > 0 && <span className="ml-1 font-normal text-muted-foreground">({history.length})</span>}
          </h2>
          {hLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Megaphone className="size-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(n => (
                <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl border bg-muted/30 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{n.body}</p>
                    <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground/60">
                      <span>{n.target}</span>·<span>{n.channel}</span>·
                      <span>{new Date(n.sentAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteNotification(n.id)}
                    className="cursor-pointer shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Templates + Stats */}
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Templates</h2>
          <div className="space-y-2">
            {templates.map(t => (
              <button key={t.label} onClick={() => setForm(p => ({ ...p, title: t.title, body: t.body }))}
                className="w-full cursor-pointer rounded-xl border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-95">
                <p className="text-sm font-medium">{t.label}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-primary" /> Audience Stats
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Total Users</span><span className="font-medium text-foreground">—</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Buyers</span><span className="font-medium text-foreground">—</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Free Users</span><span className="font-medium text-foreground">—</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
