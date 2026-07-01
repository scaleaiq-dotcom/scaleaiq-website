"use client";

import * as React from "react";
import { Plus, Tag, Copy, Trash2, Edit2, RefreshCw, X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type DiscountType = "percent" | "fixed";

interface Coupon {
  id: string; code: string; discountType: DiscountType; value: number;
  minOrder: number; maxUses: number; usageCount: number; active: boolean;
  expiresAt: string;
}

const BLANK = { code: "", discountType: "percent" as DiscountType, value: "", minOrder: "", maxUses: "", expiresAt: "", active: true };

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function AdminCoupons() {
  const [coupons,  setCoupons]  = React.useState<Coupon[]>([]);
  const [loading,  setLoading]  = React.useState(true);
  const [saving,   setSaving]   = React.useState(false);
  const [modal,    setModal]    = React.useState<typeof BLANK & { id?: string } | null>(null);
  const [isNew,    setIsNew]    = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [copied,   setCopied]   = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons").catch(() => null);
    if (res?.ok) { const d = await res.json(); setCoupons(d.coupons ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  function openNew() { setIsNew(true); setModal({ ...BLANK, code: generateCode() }); }
  function openEdit(c: Coupon) {
    setIsNew(false);
    setModal({ id: c.id, code: c.code, discountType: c.discountType, value: String(c.value), minOrder: String(c.minOrder), maxUses: String(c.maxUses), expiresAt: c.expiresAt, active: c.active });
  }

  async function save() {
    if (!modal?.code || !modal.value) return;
    setSaving(true);
    const payload = { code: modal.code.toUpperCase(), discountType: modal.discountType, value: parseFloat(modal.value), minOrder: parseFloat(modal.minOrder) || 0, maxUses: parseInt(modal.maxUses) || 100, expiresAt: modal.expiresAt, active: modal.active };
    if (isNew) {
      await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch(`/api/admin/coupons/${modal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setModal(null);
    await load();
    setSaving(false);
  }

  async function remove() {
    if (!deleteId) return;
    await fetch(`/api/admin/coupons/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !c.active }) });
    await load();
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Coupons</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{loading ? "Loading…" : `${coupons.length} coupons · ${coupons.filter(c => c.active).length} active`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </button>
          <button onClick={openNew} className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> Add Coupon
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Tag className="size-12 text-muted-foreground/20" />
            <p className="font-medium text-muted-foreground">No coupons yet</p>
            <button onClick={openNew} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
              + Add Coupon
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Code</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Discount</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Usage</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map(c => (
                <tr key={c.id} className="group transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-semibold">{c.code}</code>
                      <button onClick={() => copyCode(c.code)} className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground active:scale-95">
                        {copied === c.code ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm sm:table-cell">
                    {c.discountType === "percent" ? `${c.value}%` : `₹${c.value}`} off
                    {c.minOrder > 0 && <span className="ml-1 text-xs text-muted-foreground">min ₹{c.minOrder}</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{c.usageCount ?? 0} / {c.maxUses}</td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">{c.expiresAt || "Never"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)}
                      className={cn("cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors active:scale-95",
                        c.active ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95">
                        <Edit2 className="size-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{isNew ? "Add Coupon" : "Edit Coupon"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95"><X className="size-4" /></button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Coupon Code <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <input value={modal.code} onChange={e => setModal(p => ({ ...p!, code: e.target.value.toUpperCase() }))}
                    className="h-9 flex-1 rounded-lg border bg-background px-3 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. SAVE20" />
                  <button onClick={() => setModal(p => ({ ...p!, code: generateCode() }))}
                    className="cursor-pointer rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                    Generate
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Discount Type</label>
                  <select value={modal.discountType} onChange={e => setModal(p => ({ ...p!, discountType: e.target.value as DiscountType }))}
                    className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Value <span className="text-rose-500">*</span></label>
                  <input type="number" value={modal.value} onChange={e => setModal(p => ({ ...p!, value: e.target.value }))}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={modal.discountType === "percent" ? "20" : "100"} min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Min Order (₹)</label>
                  <input type="number" value={modal.minOrder} onChange={e => setModal(p => ({ ...p!, minOrder: e.target.value }))}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" min="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Max Uses</label>
                  <input type="number" value={modal.maxUses} onChange={e => setModal(p => ({ ...p!, maxUses: e.target.value }))}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="100" min="1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Expiry Date</label>
                <input type="date" value={modal.expiresAt} onChange={e => setModal(p => ({ ...p!, expiresAt: e.target.value }))}
                  className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={modal.active} onChange={e => setModal(p => ({ ...p!, active: e.target.checked }))} className="size-4 cursor-pointer rounded" />
                Active (usable immediately)
              </label>
            </div>
            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setModal(null)} className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={save} disabled={saving || !modal.code || !modal.value}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {isNew ? "Create Coupon" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl">
            <h2 className="font-heading text-lg font-bold">Delete Coupon?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This coupon code will no longer work at checkout.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={remove} className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
