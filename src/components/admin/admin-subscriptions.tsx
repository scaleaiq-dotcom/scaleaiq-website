"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, CreditCard, Check, X, Star, Loader2, RefreshCw } from "lucide-react";

interface Plan {
  id: string; name: string; price: number; interval: "month" | "year";
  features: string[]; active: boolean; popular: boolean;
}

const BLANK: Omit<Plan, "id"> = { name: "", price: 0, interval: "month", features: [""], active: true, popular: false };

export function AdminSubscriptions() {
  const [plans,    setPlans]    = React.useState<Plan[]>([]);
  const [loading,  setLoading]  = React.useState(true);
  const [saving,   setSaving]   = React.useState(false);
  const [modal,    setModal]    = React.useState<Plan | null>(null);
  const [isNew,    setIsNew]    = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/plans").catch(() => null);
    if (res?.ok) { const d = await res.json(); setPlans(d.plans ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  function openNew() { setIsNew(true); setModal({ id: "", ...BLANK }); }
  function openEdit(plan: Plan) { setIsNew(false); setModal({ ...plan, features: [...plan.features] }); }

  async function save() {
    if (!modal || !modal.name.trim()) return;
    setSaving(true);
    const payload = { ...modal, features: modal.features.filter(f => f.trim()) };
    if (isNew) {
      await fetch("/api/admin/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch(`/api/admin/plans/${modal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setModal(null);
    await load();
    setSaving(false);
  }

  async function toggleActive(plan: Plan) {
    await fetch(`/api/admin/plans/${plan.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !plan.active }) });
    await load();
  }

  async function togglePopular(plan: Plan) {
    await fetch(`/api/admin/plans/${plan.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ popular: !plan.popular }) });
    await load();
  }

  function setFeature(i: number, val: string) {
    if (!modal) return;
    const f = [...modal.features];
    f[i] = val;
    setModal({ ...modal, features: f });
  }

  function addFeature() {
    if (!modal) return;
    setModal({ ...modal, features: [...modal.features, ""] });
  }

  function removeFeature(i: number) {
    if (!modal) return;
    setModal({ ...modal, features: modal.features.filter((_, j) => j !== i) });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subscriptions & Plans</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{loading ? "Loading…" : `${plans.length} plans · ${plans.filter(p => p.active).length} active`}</p>
        </div>
        <div className="flex gap-2">
        <button onClick={load} disabled={loading} className="flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button onClick={openNew}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
          <Plus className="size-4" /> Add Plan
        </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <div key={plan.id}
            className={`group relative rounded-xl border bg-card p-5 transition-all hover:shadow-sm ${plan.popular ? "border-primary ring-1 ring-primary/20" : "hover:border-primary/30"}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow">
                <Star className="size-2.5" /> Most Popular
              </span>
            )}

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-base font-bold">{plan.name}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-heading text-2xl font-extrabold">₹{plan.price.toLocaleString("en-IN")}</span>
                  <span className="text-xs text-muted-foreground">/{plan.interval}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => openEdit(plan)}
                  className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95">
                  <Edit2 className="size-3.5" />
                </button>
                <button onClick={() => setDeleteId(plan.id)}
                  className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />{f}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${plan.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {plan.active ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-3 text-xs">
                <button onClick={() => togglePopular(plan)}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
                  {plan.popular ? "Unmark popular" : "Mark popular"}
                </button>
                <button onClick={() => toggleActive(plan)}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground">
                  {plan.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new tile */}
        <button onClick={openNew}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95">
          <Plus className="size-8 opacity-40" />
          <span className="text-sm font-medium">Add Plan</span>
        </button>
      </div>

      {/* Active subscribers stub */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-heading text-sm font-semibold">Active Subscribers</h2>
        <div className="flex h-20 items-center justify-center">
          <div className="text-center">
            <CreditCard className="mx-auto size-8 text-muted-foreground/20" />
            <p className="mt-1 text-sm text-muted-foreground">No subscribers yet</p>
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{isNew ? "Add Plan" : "Edit Plan"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Plan Name <span className="text-rose-500">*</span></label>
                <input value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. Pro" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input type="number" value={modal.price} onChange={e => setModal({ ...modal, price: Number(e.target.value) })}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="299" min={0} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Billing Interval</label>
                  <select value={modal.interval} onChange={e => setModal({ ...modal, interval: e.target.value as "month" | "year" })}
                    className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={modal.active} onChange={e => setModal({ ...modal, active: e.target.checked })} />
                  Active
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={modal.popular} onChange={e => setModal({ ...modal, popular: e.target.checked })} />
                  Mark as Popular
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Features</label>
                  <button type="button" onClick={addFeature}
                    className="cursor-pointer text-xs text-primary hover:underline">
                    + Add feature
                  </button>
                </div>
                {modal.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={f} onChange={e => setFeature(i, e.target.value)}
                      className="h-8 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder={`Feature ${i + 1}`} />
                    {modal.features.length > 1 && (
                      <button type="button" onClick={() => removeFeature(i)}
                        className="cursor-pointer text-muted-foreground hover:text-rose-500 active:scale-95">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setModal(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={save} disabled={!modal.name.trim()}
                className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                {isNew ? "Add Plan" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl">
            <h2 className="font-heading text-lg font-bold">Delete Plan?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Existing subscribers on this plan will not be affected. New sign-ups will no longer see this plan.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={async () => { await fetch(`/api/admin/plans/${deleteId}`, { method: "DELETE" }); setDeleteId(null); await load(); }}
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
