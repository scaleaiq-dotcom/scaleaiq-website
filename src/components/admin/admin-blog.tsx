"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, Eye, FileText, Calendar, Loader2, RefreshCw, X } from "lucide-react";

interface Post {
  id: string; title: string; slug: string; status: "draft" | "published";
  category: string; publishedAt: string; views: number; content?: string;
}

const BLANK = { title: "", slug: "", category: "", content: "" };
const FILTERS = ["All", "Published", "Draft"] as const;

export function AdminBlog() {
  const [posts,   setPosts]   = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving,  setSaving]  = React.useState(false);
  const [filter,  setFilter]  = React.useState<typeof FILTERS[number]>("All");
  const [modal,   setModal]   = React.useState<"new" | "edit" | null>(null);
  const [editing, setEditing] = React.useState<Post | null>(null);
  const [form,    setForm]    = React.useState(BLANK);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/blog").catch(() => null);
    if (res?.ok) { const d = await res.json(); setPosts(d.posts ?? []); }
    setLoading(false);
  }

  React.useEffect(() => { load(); }, []);

  function openNew() {
    setForm(BLANK);
    setEditing(null);
    setModal("new");
  }

  function openEdit(p: Post) {
    setForm({ title: p.title, slug: p.slug, category: p.category, content: p.content ?? "" });
    setEditing(p);
    setModal("edit");
  }

  async function publish(status: "published" | "draft") {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, status };
    if (modal === "new") {
      await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    } else if (editing) {
      await fetch(`/api/admin/blog/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    }
    setModal(null);
    await load();
    setSaving(false);
  }

  async function remove() {
    if (!deleteId) return;
    await fetch(`/api/admin/blog/${deleteId}`, { method: "DELETE" }).catch(() => null);
    setDeleteId(null);
    await load();
  }

  const displayed = posts.filter(p => filter === "All" || p.status === filter.toLowerCase());

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50 active:scale-95">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95">
            <Plus className="size-4" /> New Post
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Title</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Category</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Published</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading posts…
                </div>
              </td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-14 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="size-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">{filter === "All" ? "No blog posts yet" : `No ${filter.toLowerCase()} posts`}</p>
                  {filter === "All" && (
                    <button onClick={openNew} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:scale-95">
                      Write First Post
                    </button>
                  )}
                </div>
              </td></tr>
            ) : displayed.map(post => (
              <tr key={post.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                  <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{post.category || "Uncategorized"}</span>
                </td>
                <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${post.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95">
                      <Eye className="size-3.5" />
                    </button>
                    <button onClick={() => openEdit(post)} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95">
                      <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(post.id)} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-heading text-lg font-bold">{modal === "new" ? "New Blog Post" : "Edit Post"}</h2>
              <button onClick={() => setModal(null)} className="cursor-pointer rounded-lg p-1.5 hover:bg-accent active:scale-95"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Title <span className="text-rose-500">*</span></label>
                  <input value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: modal === "new" ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : p.slug }))}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Post title" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Category</label>
                  <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="e.g. AI, Finance, Tips" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">URL Slug</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="auto-generated-from-title" />
                <p className="text-xs text-muted-foreground">scaleaiq.com/blog/{form.slug || "your-post-title"}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Content <span className="text-xs text-muted-foreground">(Markdown supported)</span></label>
                <textarea rows={12} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Write your blog post here…"
                  className="w-full resize-y rounded-lg border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div className="flex gap-3 border-t px-6 py-4">
              <button onClick={() => setModal(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={() => publish("draft")} disabled={saving || !form.title.trim()}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />} Save Draft
              </button>
              <button onClick={() => publish("published")} disabled={saving || !form.title.trim()}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 active:scale-95">
                {saving && <Loader2 className="size-3.5 animate-spin" />} Publish
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
            <h2 className="font-heading text-lg font-bold">Delete Post?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This post will be permanently removed.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 cursor-pointer rounded-lg border py-2 text-sm font-medium hover:bg-accent active:scale-95">Cancel</button>
              <button onClick={remove}
                className="flex-1 cursor-pointer rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600 active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
