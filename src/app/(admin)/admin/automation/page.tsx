"use client";

import * as React from "react";
import {
  Plus, X, Edit2, Trash2, Zap, Play, Pause,
  Mail, Bell, Tag, Users, ShoppingBag, CalendarDays, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Trigger = "user_signup" | "order_success" | "cart_abandon" | "workshop_24h" | "new_product" | "custom";
type Action  = "send_email" | "send_whatsapp" | "send_notification" | "add_tag" | "custom";

interface Flow {
  id: string; name: string; description: string;
  trigger: Trigger; action: Action;
  active: boolean; runs: number; lastRun: string | null;
}

const TRIGGERS: { value: Trigger; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "user_signup",   label: "User Sign Up",           desc: "Fires when a new user registers",        icon: Users },
  { value: "order_success", label: "Order Success",          desc: "Fires after a successful purchase",      icon: ShoppingBag },
  { value: "cart_abandon",  label: "Cart Abandoned",         desc: "Cart idle for 30+ minutes",              icon: Tag },
  { value: "workshop_24h",  label: "Workshop Reminder",      desc: "24 hours before a workshop",             icon: CalendarDays },
  { value: "new_product",   label: "New Product Published",  desc: "Fires when a product goes live",         icon: Zap },
  { value: "custom",        label: "Custom / Manual",        desc: "Trigger manually from the dashboard",    icon: Play },
];

const ACTIONS: { value: Action; label: string; icon: React.ElementType }[] = [
  { value: "send_email",        label: "Send Email",          icon: Mail },
  { value: "send_whatsapp",     label: "Send WhatsApp",       icon: Bell },
  { value: "send_notification", label: "Push Notification",   icon: Bell },
  { value: "add_tag",           label: "Add Tag to User",     icon: Tag },
  { value: "custom",            label: "Custom Webhook",      icon: Zap },
];

const BLANK: Omit<Flow, "id" | "runs" | "lastRun"> = {
  name: "", description: "", trigger: "user_signup", action: "send_email", active: false,
};

const PRESET_FLOWS: Flow[] = [
  { id: "p1", name: "Welcome Email",         description: "Send a welcome email when someone signs up",          trigger: "user_signup",   action: "send_email",        active: true,  runs: 0, lastRun: null },
  { id: "p2", name: "Purchase Confirmation", description: "Email order details after a successful purchase",     trigger: "order_success", action: "send_email",        active: true,  runs: 0, lastRun: null },
  { id: "p3", name: "Abandoned Cart Nudge",  description: "WhatsApp message after cart is idle for 30 minutes", trigger: "cart_abandon",  action: "send_whatsapp",     active: false, runs: 0, lastRun: null },
  { id: "p4", name: "Workshop Reminder",     description: "Notify registered users 24h before the workshop",    trigger: "workshop_24h",  action: "send_notification", active: false, runs: 0, lastRun: null },
];

function TriggerIcon({ trigger }: { trigger: Trigger }) {
  const t = TRIGGERS.find(t => t.value === trigger);
  if (!t) return <Zap className="size-4" />;
  return <t.icon className="size-4" />;
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

export default function AutomationPage() {
  const [flows, setFlows]     = React.useState<Flow[]>(PRESET_FLOWS);
  const [modal, setModal]     = React.useState<Flow | null>(null);
  const [isNew, setIsNew]     = React.useState(false);
  const [deleteId, setDelete] = React.useState<string | null>(null);
  const [search, setSearch]   = React.useState("");

  function openNew() {
    setIsNew(true);
    setModal({ id: crypto.randomUUID(), runs: 0, lastRun: null, ...BLANK });
  }

  function openEdit(f: Flow) { setIsNew(false); setModal({ ...f }); }

  function save() {
    if (!modal?.name.trim()) return;
    if (isNew) setFlows(p => [...p, modal]);
    else setFlows(p => p.map(f => f.id === modal.id ? modal : f));
    setModal(null);
  }

  function toggle(id: string) {
    setFlows(p => p.map(f => f.id === id ? { ...f, active: !f.active } : f));
  }

  const filtered = flows.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = flows.filter(f => f.active).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Automation</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {flows.length} flows · {activeCount} active
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-48 rounded-lg border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search flows…" />
          </div>
          <button onClick={openNew}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> New Flow
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {[
          { label: "Total Flows",  value: flows.length,                                      color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Active",       value: activeCount,                                        color: "text-emerald-500",bg: "bg-emerald-500/10" },
          { label: "Total Runs",   value: flows.reduce((s, f) => s + f.runs, 0),             color: "text-blue-500",   bg: "bg-blue-500/10" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className={cn("mb-2 inline-flex rounded-lg p-1.5", s.bg)}>
              <Zap className={cn("size-3.5", s.color)} />
            </div>
            <p className="font-heading text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Flow list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-16 text-center">
          <Zap className="size-12 text-muted-foreground/20" />
          <p className="font-medium text-muted-foreground">{search ? "No matching flows" : "No automation flows yet"}</p>
          {!search && (
            <button onClick={openNew}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
              + Create First Flow
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {filtered.map(flow => {
            const triggerInfo = TRIGGERS.find(t => t.value === flow.trigger);
            const actionInfo  = ACTIONS.find(a => a.value === flow.action);
            return (
              <div key={flow.id}
                className={cn("rounded-xl border bg-card p-4 transition-all hover:shadow-sm",
                  flow.active ? "border-emerald-200" : "hover:border-primary/20")}>
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl",
                    flow.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    <TriggerIcon trigger={flow.trigger} />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{flow.name}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold",
                        flow.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>
                        {flow.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{flow.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Trigger:</span> {triggerInfo?.label}
                      </span>
                      <span className="text-muted-foreground/40">→</span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Action:</span> {actionInfo?.label}
                      </span>
                      {flow.runs > 0 && (
                        <span className="ml-auto">{flow.runs} runs</span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => toggle(flow.id)}
                      className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors active:scale-95",
                        flow.active
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border bg-muted text-muted-foreground hover:bg-muted/80")}>
                      {flow.active ? <><Pause className="size-3" />Pause</> : <><Play className="size-3" />Enable</>}
                    </button>
                    <button onClick={() => openEdit(flow)}
                      className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95">
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => setDelete(flow.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{isNew ? "New Automation Flow" : "Edit Flow"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <Field label="Flow Name *">
                <input value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Welcome New Users" />
              </Field>

              <Field label="Description">
                <textarea value={modal.description} onChange={e => setModal({ ...modal, description: e.target.value })} rows={2}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="What does this flow do?" />
              </Field>

              {/* Trigger */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Trigger — When should this run?</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRIGGERS.map(t => (
                    <button key={t.value} type="button" onClick={() => setModal({ ...modal, trigger: t.value })}
                      className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-left transition-all active:scale-95",
                        modal.trigger === t.value ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/30")}>
                      <t.icon className={cn("mt-0.5 size-4 shrink-0", modal.trigger === t.value ? "text-primary" : "text-muted-foreground")} />
                      <div>
                        <p className="text-xs font-semibold">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Action — What should happen?</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map(a => (
                    <button key={a.value} type="button" onClick={() => setModal({ ...modal, action: a.value })}
                      className={cn("flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-left transition-all active:scale-95",
                        modal.action === a.value ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/30")}>
                      <a.icon className={cn("size-4 shrink-0", modal.action === a.value ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={modal.active} onChange={e => setModal({ ...modal, active: e.target.checked })} />
                Enable this flow immediately
              </label>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setModal(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={save} disabled={!modal.name.trim()}
                className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                {isNew ? "Create Flow" : "Save Changes"}
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
            <h2 className="font-heading text-lg font-bold">Delete Flow?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This automation will stop running and cannot be recovered.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDelete(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={() => { setFlows(p => p.filter(f => f.id !== deleteId)); setDelete(null); }}
                className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
