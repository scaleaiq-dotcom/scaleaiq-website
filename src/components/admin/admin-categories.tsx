"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, GripVertical, FolderOpen, X, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  productCount: number;
}

const BLANK = { name: "", slug: "", icon: "Tag" };

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AdminCategories() {
  const [cats, setCats] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCats(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  function openNew() {
    setIsNew(true);
    setModal({ ...BLANK, order: cats.length + 1 });
  }

  function openEdit(c: Category) {
    setIsNew(false);
    setModal({ ...c });
  }

  async function save() {
    if (!modal?.name?.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modal),
        });
      } else {
        await fetch(`/api/admin/categories/${modal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: modal.name, slug: modal.slug, icon: modal.icon }),
        });
      }
      setModal(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteId) return;
    await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Categories</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${cats.length} categories`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </button>
          <button onClick={openNew}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : cats.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FolderOpen className="size-12 text-muted-foreground/20" />
            <div>
              <p className="font-medium text-muted-foreground">No categories yet</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Add your first category to organise products.</p>
            </div>
            <button onClick={openNew}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
              + Add Category
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Products</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cats.map(cat => (
                <tr key={cat.id} className="group transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <GripVertical className="size-4 cursor-grab text-muted-foreground/30 group-hover:text-muted-foreground" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                        <FolderOpen className="size-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cat.productCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(cat)}
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95">
                        <Edit2 className="size-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(cat.id)}
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 active:scale-95">
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
              <h2 className="font-heading text-lg font-bold">{isNew ? "Add Category" : "Edit Category"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name <span className="text-rose-500">*</span></label>
                <input
                  value={modal.name ?? ""}
                  onChange={e => setModal(p => ({ ...p!, name: e.target.value, slug: isNew ? slugify(e.target.value) : p!.slug }))}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. AI Tools"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Slug</label>
                <input
                  value={modal.slug ?? ""}
                  onChange={e => setModal(p => ({ ...p!, slug: e.target.value }))}
                  className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. ai-tools"
                />
                <p className="text-xs text-muted-foreground">Used in URLs — auto-generated from name.</p>
              </div>
            </div>

            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setModal(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent active:scale-95">
                Cancel
              </button>
              <button onClick={save} disabled={saving || !modal.name?.trim()}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {isNew ? "Add Category" : "Save Changes"}
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
            <h2 className="font-heading text-lg font-bold">Delete Category?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will remove the category. Products in this category will not be deleted but will lose their category assignment.
            </p>
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
