"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Save, Eye, Loader2, Plus, Trash2, GripVertical, Upload,
  ChevronRight, Globe, BookOpen, MessageCircle, Mail,
  Video, FileText, Download, Play, ArrowLeftRight, ExternalLink,
  BarChart3, TrendingUp, Users, Star, CheckCircle2, X,
} from "lucide-react";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "pricing", label: "Pricing" },
  { id: "media", label: "Media" },
  { id: "experience", label: "Experience" },
  { id: "content", label: "Content" },
  { id: "downloads", label: "Downloads" },
  { id: "tutorials", label: "Tutorials" },
  { id: "resources", label: "Resources" },
  { id: "access", label: "Access" },
  { id: "seo", label: "SEO" },
  { id: "updates", label: "Updates" },
  { id: "analytics", label: "Analytics" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Categories loaded from Firestore at runtime
const PTYPES = ["Course","AI Tool","Prompt Pack","Automation","Template","Service","AI Agent","Download","Workshop","External App"];
const DL_TYPES = ["PDF","ZIP","Prompt Pack","Workflow","Code","Template","Checklist","Bonus","Certificate","Other"];
const LAUNCH = ["Internal Page","External URL","Download","Course","AI Tool","AI Agent","API","Service"];

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface Tutorial {
  id: string; title: string; videoUrl: string; duration: string;
  description: string; order: number; free: boolean;
}
interface DLItem {
  id: string; type: string; title: string; description: string;
  version: string; file: string; order: number;
}
interface VUpdate {
  id: string; version: string; notes: string;
  newFeatures: string; bugFixes: string; date: string;
}

interface FS {
  title: string; slug: string; category: string; subcategory: string; tags: string;
  shortDesc: string; fullDesc: string; productType: string; status: string;
  featured: boolean; comingSoon: boolean; isNew: boolean; trending: boolean; bestSeller: boolean; freeThisWeek: boolean;
  pricingType: string; price: string; salePrice: string; currency: string;
  thumbnail: string; heroBanner: string; productIcon: string; ogImage: string;
  pvEnabled: boolean; pvUrl: string;
  pdfEnabled: boolean; pdfPages: string;
  sampleEnabled: boolean; sampleUrl: string;
  demoEnabled: boolean; demoUrl: string; demoMode: string;
  baEnabled: boolean; beforeImg: string; afterImg: string;
  extDemoEnabled: boolean; extDemoUrl: string;
  features: string; benefits: string; requirements: string; audience: string; included: string;
  tutorials: Tutorial[]; downloads: DLItem[];
  docUrl: string; githubUrl: string; websiteUrl: string; communityUrl: string; supportEmail: string;
  launchType: string; launchUrl: string; access: string;
  seoTitle: string; metaDesc: string; keywords: string; ogTitle: string; ogDesc: string;
  updates: VUpdate[];
}

const DEF: FS = {
  title: "", slug: "", category: "", subcategory: "", tags: "",
  shortDesc: "", fullDesc: "", productType: "Download", status: "draft",
  featured: false, comingSoon: false, isNew: true, trending: false, bestSeller: false, freeThisWeek: false,
  pricingType: "one_time", price: "", salePrice: "", currency: "INR",
  thumbnail: "", heroBanner: "", productIcon: "", ogImage: "",
  pvEnabled: false, pvUrl: "",
  pdfEnabled: false, pdfPages: "",
  sampleEnabled: false, sampleUrl: "",
  demoEnabled: false, demoUrl: "", demoMode: "modal",
  baEnabled: false, beforeImg: "", afterImg: "",
  extDemoEnabled: false, extDemoUrl: "",
  features: "", benefits: "", requirements: "", audience: "", included: "",
  tutorials: [], downloads: [],
  docUrl: "", githubUrl: "", websiteUrl: "", communityUrl: "", supportEmail: "",
  launchType: "Download", launchUrl: "", access: "purchase_required",
  seoTitle: "", metaDesc: "", keywords: "", ogTitle: "", ogDesc: "",
  updates: [],
};

function FLD({ label, hint, children, req }: {
  label: string; hint?: string; children: React.ReactNode; req?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label}{req && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => set(!on)}
      className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}>
      <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", on ? "translate-x-4" : "translate-x-0.5")} />
    </button>
  );
}

function Chip({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => set(!on)}
      className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        on ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground hover:border-foreground")}>
      {label}
    </button>
  );
}

export function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabId>("overview");
  const [form, setForm] = React.useState<FS>(DEF);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(!!productId);
  const [categories, setCategories] = React.useState<{ id: string; name: string; slug: string }[]>([]);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [uploading, setUploading] = React.useState<keyof FS | null>(null);
  const [uploadError, setUploadError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/admin/products/${productId}`)
      .then(r => r.json())
      .then(({ product }) => {
        if (!product) return;
        setForm({
          title: product.title ?? "",
          slug: product.slug ?? "",
          category: product.category ?? "",
          subcategory: product.subcategory ?? "",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags ?? ""),
          shortDesc: product.shortDesc ?? "",
          fullDesc: product.fullDesc ?? "",
          productType: product.productType ?? "Download",
          status: product.status ?? "draft",
          featured: product.featured ?? false,
          comingSoon: product.comingSoon ?? false,
          isNew: product.isNew ?? false,
          trending: product.trending ?? false,
          bestSeller: product.bestSeller ?? false,
          freeThisWeek: product.freeThisWeek ?? false,
          pricingType: product.pricingType ?? "one_time",
          price: product.price != null ? String(product.price) : "",
          salePrice: product.salePrice != null ? String(product.salePrice) : "",
          currency: product.currency ?? "INR",
          thumbnail: product.thumbnail ?? "",
          heroBanner: product.heroBanner ?? "",
          productIcon: product.productIcon ?? "",
          ogImage: product.ogImage ?? "",
          pvEnabled: product.pvEnabled ?? false,
          pvUrl: product.pvUrl ?? "",
          pdfEnabled: product.pdfEnabled ?? false,
          pdfPages: product.pdfPages ?? "",
          sampleEnabled: product.sampleEnabled ?? false,
          sampleUrl: product.sampleUrl ?? "",
          demoEnabled: product.demoEnabled ?? false,
          demoUrl: product.demoUrl ?? "",
          demoMode: product.demoMode ?? "modal",
          baEnabled: product.baEnabled ?? false,
          beforeImg: product.beforeImg ?? "",
          afterImg: product.afterImg ?? "",
          extDemoEnabled: product.extDemoEnabled ?? false,
          extDemoUrl: product.extDemoUrl ?? "",
          features: product.features ?? "",
          benefits: product.benefits ?? "",
          requirements: product.requirements ?? "",
          audience: product.audience ?? "",
          included: product.included ?? "",
          tutorials: product.tutorials ?? [],
          downloads: product.downloads ?? [],
          docUrl: product.docUrl ?? "",
          githubUrl: product.githubUrl ?? "",
          websiteUrl: product.websiteUrl ?? "",
          communityUrl: product.communityUrl ?? "",
          supportEmail: product.supportEmail ?? "",
          launchType: product.launchType ?? "Download",
          launchUrl: product.launchUrl ?? "",
          access: product.access ?? "purchase_required",
          seoTitle: product.seoTitle ?? "",
          metaDesc: product.metaDesc ?? "",
          keywords: product.keywords ?? "",
          ogTitle: product.ogTitle ?? "",
          ogDesc: product.ogDesc ?? "",
          updates: product.updates ?? [],
        });
      })
      .finally(() => setLoading(false));
  }, [productId]);

  function upd<K extends keyof FS>(k: K, v: FS[K]) {
    setForm(p => {
      const n = { ...p, [k]: v };
      if (k === "title") n.slug = slugify(v as string);
      return n;
    });
  }

  async function save(status?: string) {
    setSaving(true);
    setSuccessMsg("");
    try {
      const payload = status ? { ...form, status } : form;
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const res = await fetch(url, {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        const published = (status ?? form.status) === "published";
        if (!productId) {
          if (published) {
            // Publish success on a new product: clear the form so the next one can be added right away
            setForm(DEF);
            setTab("overview");
            setSuccessMsg("🎉 Product published! The form has been cleared — add your next product.");
          } else {
            // Draft: keep editing the same product
            const d = await res.json();
            router.push(`/admin/products/${d.id}`);
            return;
          }
        } else {
          setSuccessMsg(published ? "✅ Product published successfully." : "✅ Changes saved.");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSuccessMsg("⚠️ Failed to save. Please try again.");
      }
    } finally { setSaving(false); }
  }

  async function uploadImage(file: File, field: keyof FS) {
    setUploadError("");
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is larger than 5MB. Choose a smaller file or paste a URL.");
      return;
    }
    setUploading(field);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `products/${productId ?? "new"}/${Date.now()}-${safeName}`;
      const r = storageRef(storage, path);
      await uploadBytes(r, file);
      const dlUrl = await getDownloadURL(r);
      upd(field, dlUrl as never);
    } catch {
      setUploadError("Upload failed. Ensure Firebase Storage is enabled, or paste an image URL instead.");
    } finally {
      setUploading(null);
    }
  }

  const addT = () => upd("tutorials", [...form.tutorials, { id: crypto.randomUUID(), title: "", videoUrl: "", duration: "", description: "", order: form.tutorials.length + 1, free: true }]);
  const setT = (id: string, k: keyof Tutorial, v: unknown) => upd("tutorials", form.tutorials.map(t => t.id === id ? { ...t, [k]: v } : t));
  const delT = (id: string) => upd("tutorials", form.tutorials.filter(t => t.id !== id));

  const addD = () => upd("downloads", [...form.downloads, { id: crypto.randomUUID(), type: "PDF", title: "", description: "", version: "1.0", file: "", order: form.downloads.length + 1 }]);
  const setD = (id: string, k: keyof DLItem, v: unknown) => upd("downloads", form.downloads.map(d => d.id === id ? { ...d, [k]: v } : d));
  const delD = (id: string) => upd("downloads", form.downloads.filter(d => d.id !== id));

  const addU = () => upd("updates", [...form.updates, { id: crypto.randomUUID(), version: "", notes: "", newFeatures: "", bugFixes: "", date: new Date().toISOString().slice(0, 10) }]);
  const setU = (id: string, k: keyof VUpdate, v: unknown) => upd("updates", form.updates.map(u => u.id === id ? { ...u, [k]: v } : u));
  const delU = (id: string) => upd("updates", form.updates.filter(u => u.id !== id));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          <span className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0" />{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{form.title || "New Product"}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {productId ? "Editing" : "Creating"} • {form.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {form.slug && (
            <a href={`/product/${form.slug}`} target="_blank"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Eye className="size-3.5" />Preview
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => save("draft")} disabled={saving}>
            Save Draft
          </Button>
          <Button size="sm" onClick={() => save("published")} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saved ? "Saved!" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-4 overflow-x-auto border-b">
        <div className="flex min-w-max">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                tab === t.id
                  ? "border-b-2 border-primary text-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="grid gap-5 max-w-2xl">
            <FLD label="Product Title" req>
              <Input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="e.g. AI Prompt Pack Pro" />
            </FLD>
            <FLD label="Slug" hint="Auto-generated. Edit to customize URL.">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted-foreground">/product/</span>
                <Input value={form.slug} onChange={e => upd("slug", e.target.value)} placeholder="ai-prompt-pack-pro" />
              </div>
            </FLD>
            <div className="grid grid-cols-2 gap-4">
              <FLD label="Category">
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none"
                  value={form.category} onChange={e => upd("category", e.target.value)}>
                  <option value="">— Select category —</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </FLD>
              <FLD label="Subcategory">
                <Input value={form.subcategory} onChange={e => upd("subcategory", e.target.value)} placeholder="e.g. ChatGPT Prompts" />
              </FLD>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FLD label="Product Type">
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none"
                  value={form.productType} onChange={e => upd("productType", e.target.value)}>
                  {PTYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </FLD>
              <FLD label="Status">
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none"
                  value={form.status} onChange={e => upd("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="archived">Archived</option>
                </select>
              </FLD>
            </div>
            <FLD label="Tags" hint="Comma-separated: AI, ChatGPT, Productivity">
              <Input value={form.tags} onChange={e => upd("tags", e.target.value)} placeholder="AI, ChatGPT, Productivity, Students" />
            </FLD>
            <FLD label="Short Description" hint="Shown in product cards, max 160 chars">
              <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/30"
                rows={2} maxLength={160} value={form.shortDesc} onChange={e => upd("shortDesc", e.target.value)}
                placeholder="A powerful collection of 200+ ChatGPT prompts..." />
              <p className="text-right text-[10px] text-muted-foreground">{form.shortDesc.length}/160</p>
            </FLD>
            <FLD label="Full Description">
              <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/30"
                rows={6} value={form.fullDesc} onChange={e => upd("fullDesc", e.target.value)}
                placeholder="Detailed product description..." />
            </FLD>
            <div>
              <p className="mb-2 text-sm font-medium">Labels</p>
              <div className="flex flex-wrap gap-2">
                <Chip on={form.featured} set={v => upd("featured", v)} label="Featured" />
                <Chip on={form.isNew} set={v => upd("isNew", v)} label="New" />
                <Chip on={form.trending} set={v => upd("trending", v)} label="Trending" />
                <Chip on={form.bestSeller} set={v => upd("bestSeller", v)} label="Best Seller" />
                <Chip on={form.freeThisWeek} set={v => upd("freeThisWeek", v)} label="Free This Week" />
                <Chip on={form.comingSoon} set={v => upd("comingSoon", v)} label="Coming Soon" />
              </div>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab === "pricing" && (
          <div className="grid gap-5 max-w-xl">
            <div>
              <p className="mb-3 text-sm font-medium">Pricing Type</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[{ id: "free", l: "Free" }, { id: "one_time", l: "One-Time" }, { id: "subscription", l: "Subscription" }, { id: "external", l: "External" }].map(pt => (
                  <button key={pt.id} type="button" onClick={() => upd("pricingType", pt.id)}
                    className={cn("rounded-xl border p-4 text-sm font-medium transition-all",
                      form.pricingType === pt.id ? "border-primary bg-primary/5 text-primary shadow-sm" : "hover:border-primary/40")}>
                    {pt.l}
                  </button>
                ))}
              </div>
            </div>
            {form.pricingType !== "free" && form.pricingType !== "external" && (
              <div className="grid grid-cols-2 gap-4">
                <FLD label="Price (INR)" req>
                  <Input type="number" value={form.price} onChange={e => upd("price", e.target.value)} placeholder="299" />
                </FLD>
                <FLD label="Sale Price" hint="Leave empty if no discount">
                  <Input type="number" value={form.salePrice} onChange={e => upd("salePrice", e.target.value)} placeholder="199" />
                </FLD>
              </div>
            )}
            {form.pricingType === "free" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="text-sm font-medium text-emerald-600">Free Product</p>
                <p className="text-xs text-muted-foreground mt-1">Users can access after sign-in at no cost.</p>
              </div>
            )}
          </div>
        )}

        {/* ── MEDIA ── */}
        {tab === "media" && (
          <div className="grid gap-6 max-w-2xl">
            {uploadError && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-900/20">
                {uploadError}
              </p>
            )}
            {[
              { k: "thumbnail" as keyof FS, l: "Thumbnail", h: "16:9, 800x450px recommended" },
              { k: "heroBanner" as keyof FS, l: "Hero Banner", h: "1200x400px recommended" },
              { k: "productIcon" as keyof FS, l: "Product Icon", h: "256x256px square" },
              { k: "ogImage" as keyof FS, l: "OG Image", h: "1200x630px for social sharing" },
            ].map(f => (
              <FLD key={f.k as string} label={f.l} hint={f.h}>
                {form[f.k] ? (
                  <div className="relative overflow-hidden rounded-xl border">
                    <img src={form[f.k] as string} alt={f.l} className="w-full max-h-40 object-cover" />
                    <button onClick={() => upd(f.k, "" as never)} className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">
                      <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-primary/5">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading === f.k}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file, f.k);
                          e.target.value = "";
                        }}
                      />
                      {uploading === f.k ? (
                        <>
                          <Loader2 className="size-8 animate-spin text-primary" />
                          <p className="text-sm font-medium">Uploading…</p>
                        </>
                      ) : (
                        <>
                          <Upload className="size-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Click to upload image</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
                        </>
                      )}
                    </label>
                    <Input type="url" placeholder="Or paste image URL" className="max-w-xs"
                      onBlur={e => { if (e.target.value) upd(f.k, e.target.value as never); }} />
                  </div>
                )}
              </FLD>
            ))}
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {tab === "experience" && (
          <div className="space-y-5 max-w-2xl">
            <p className="text-sm text-muted-foreground">Enable preview methods so buyers can experience the product before purchasing.</p>
            {[
              {
                on: form.pvEnabled, set: (v: boolean) => upd("pvEnabled", v),
                Icon: Video, color: "text-violet-500", label: "Preview Video",
                extra: form.pvEnabled && (
                  <div className="mt-3">
                    <Input value={form.pvUrl} onChange={e => upd("pvUrl", e.target.value)} placeholder="YouTube / Vimeo URL" />
                  </div>
                ),
              },
              {
                on: form.pdfEnabled, set: (v: boolean) => upd("pdfEnabled", v),
                Icon: FileText, color: "text-blue-500", label: "PDF Preview",
                extra: form.pdfEnabled && (
                  <div className="mt-3">
                    <Input value={form.pdfPages} onChange={e => upd("pdfPages", e.target.value)} placeholder="Preview pages e.g. 1-5" />
                  </div>
                ),
              },
              {
                on: form.sampleEnabled, set: (v: boolean) => upd("sampleEnabled", v),
                Icon: Download, color: "text-amber-500", label: "Sample Download",
                extra: form.sampleEnabled && (
                  <div className="mt-3">
                    <Input value={form.sampleUrl} onChange={e => upd("sampleUrl", e.target.value)} placeholder="Sample file URL" />
                  </div>
                ),
              },
              {
                on: form.demoEnabled, set: (v: boolean) => upd("demoEnabled", v),
                Icon: Play, color: "text-rose-500", label: "Interactive Demo",
                extra: form.demoEnabled && (
                  <div className="mt-3 grid gap-2">
                    <Input value={form.demoUrl} onChange={e => upd("demoUrl", e.target.value)} placeholder="Demo URL" />
                    <select className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
                      value={form.demoMode} onChange={e => upd("demoMode", e.target.value)}>
                      <option value="modal">Open in Modal</option>
                      <option value="tab">Open in New Tab</option>
                    </select>
                  </div>
                ),
              },
              {
                on: form.baEnabled, set: (v: boolean) => upd("baEnabled", v),
                Icon: ArrowLeftRight, color: "text-cyan-500", label: "Before and After Showcase",
                extra: form.baEnabled && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Input value={form.beforeImg} onChange={e => upd("beforeImg", e.target.value)} placeholder="Before image URL" />
                    <Input value={form.afterImg} onChange={e => upd("afterImg", e.target.value)} placeholder="After image URL" />
                  </div>
                ),
              },
              {
                on: form.extDemoEnabled, set: (v: boolean) => upd("extDemoEnabled", v),
                Icon: ExternalLink, color: "text-indigo-500", label: "External Demo",
                extra: form.extDemoEnabled && (
                  <div className="mt-3">
                    <Input value={form.extDemoUrl} onChange={e => upd("extDemoUrl", e.target.value)} placeholder="https://demo.example.com" />
                  </div>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.Icon className={cn("size-4", item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Toggle on={item.on} set={item.set} />
                </div>
                {item.extra}
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === "content" && (
          <div className="grid gap-5 max-w-2xl">
            {[
              { k: "features" as keyof FS, l: "Features", p: "- AI-powered writing\n- 200+ templates" },
              { k: "benefits" as keyof FS, l: "Benefits", p: "- Save 10+ hours per week" },
              { k: "requirements" as keyof FS, l: "Requirements", p: "- ChatGPT account (free or Plus)" },
              { k: "audience" as keyof FS, l: "Target Audience", p: "- Students\n- Content creators" },
              { k: "included" as keyof FS, l: "What is Included", p: "- 200+ ChatGPT prompts\n- PDF guide" },
            ].map(f => (
              <FLD key={f.k as string} label={f.l} hint="One item per line. Use - for bullets.">
                <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  rows={4} value={form[f.k] as string}
                  onChange={e => upd(f.k, e.target.value as never)} placeholder={f.p} />
              </FLD>
            ))}
          </div>
        )}

        {/* ── TUTORIALS ── */}
        {tab === "tutorials" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{form.tutorials.length} Tutorials</p>
              <Button size="sm" variant="outline" onClick={addT}><Plus className="mr-1 size-3.5" />Add Tutorial</Button>
            </div>
            {form.tutorials.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed py-12 text-center">
                <Video className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No tutorials yet</p>
                <Button size="sm" variant="outline" onClick={addT}><Plus className="mr-1 size-3.5" />Add Tutorial</Button>
              </div>
            )}
            {form.tutorials.map((t, i) => (
              <div key={t.id} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Tutorial {i + 1}</span>
                  <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={t.free} onChange={e => setT(t.id, "free", e.target.checked)} />
                    Free Preview
                  </label>
                  <button onClick={() => delT(t.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={t.title} onChange={e => setT(t.id, "title", e.target.value)} placeholder="Tutorial title" />
                  <Input value={t.duration} onChange={e => setT(t.id, "duration", e.target.value)} placeholder="Duration e.g. 8:30" />
                </div>
                <Input value={t.videoUrl} onChange={e => setT(t.id, "videoUrl", e.target.value)} placeholder="Video URL (YouTube / Vimeo)" />
                <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={2}
                  value={t.description} onChange={e => setT(t.id, "description", e.target.value)} placeholder="Brief description..." />
              </div>
            ))}
          </div>
        )}

        {/* ── DOWNLOADS ── */}
        {tab === "downloads" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{form.downloads.length} Downloadable Files</p>
              <Button size="sm" variant="outline" onClick={addD}><Plus className="mr-1 size-3.5" />Add File</Button>
            </div>
            {form.downloads.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed py-12 text-center">
                <Download className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No downloadable files yet</p>
                <Button size="sm" variant="outline" onClick={addD}><Plus className="mr-1 size-3.5" />Add Download</Button>
              </div>
            )}
            {form.downloads.map((d, i) => (
              <div key={d.id} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">File {i + 1}</span>
                  <button onClick={() => delD(d.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="h-9 rounded-md border bg-background px-3 text-sm outline-none"
                    value={d.type} onChange={e => setD(d.id, "type", e.target.value)}>
                    {DL_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <Input value={d.version} onChange={e => setD(d.id, "version", e.target.value)} placeholder="Version e.g. 1.2" />
                </div>
                <Input value={d.title} onChange={e => setD(d.id, "title", e.target.value)} placeholder="File title" />
                <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={2}
                  value={d.description} onChange={e => setD(d.id, "description", e.target.value)} placeholder="What does this file contain?" />
                <Input type="url" value={d.file} onChange={e => setD(d.id, "file", e.target.value)} placeholder="File URL" />
              </div>
            ))}
          </div>
        )}

        {/* ── RESOURCES ── */}
        {tab === "resources" && (
          <div className="grid gap-5 max-w-xl">
            {[
              { k: "docUrl" as keyof FS, I: BookOpen, l: "Documentation", p: "https://docs.example.com" },
              { k: "websiteUrl" as keyof FS, I: Globe, l: "Official Website", p: "https://example.com" },
              { k: "communityUrl" as keyof FS, I: MessageCircle, l: "Community (Telegram / Discord)", p: "https://t.me/..." },
              { k: "supportEmail" as keyof FS, I: Mail, l: "Support Email", p: "support@scaleaiq.in" },
            ].map(f => (
              <FLD key={f.k as string} label={f.l}>
                <div className="relative">
                  <f.I className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input value={form[f.k] as string} onChange={e => upd(f.k, e.target.value as never)}
                    placeholder={f.p} className="pl-9" />
                </div>
              </FLD>
            ))}
            <FLD label="GitHub Repository">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <Input value={form.githubUrl} onChange={e => upd("githubUrl", e.target.value)} placeholder="https://github.com/..." className="pl-9" />
              </div>
            </FLD>
          </div>
        )}

        {/* ── ACCESS ── */}
        {tab === "access" && (
          <div className="grid gap-6 max-w-xl">
            <div>
              <p className="mb-3 text-sm font-medium">Launch Type</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {LAUNCH.map(lt => (
                  <button key={lt} type="button" onClick={() => upd("launchType", lt)}
                    className={cn("rounded-xl border px-3 py-2.5 text-xs font-medium transition-all",
                      form.launchType === lt ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40")}>
                    {lt}
                  </button>
                ))}
              </div>
            </div>
            {form.launchType === "External URL" && (
              <FLD label="External URL">
                <Input value={form.launchUrl} onChange={e => upd("launchUrl", e.target.value)} placeholder="https://..." />
              </FLD>
            )}
            <div>
              <p className="mb-3 text-sm font-medium">Access Permission</p>
              <div className="space-y-2">
                {[
                  { id: "public", l: "Public", d: "Anyone can access without sign-in" },
                  { id: "login_required", l: "Login Required", d: "User must be signed in" },
                  { id: "purchase_required", l: "Purchase Required", d: "User must purchase this product" },
                  { id: "subscription_required", l: "Subscription Required", d: "Active subscription required" },
                ].map(a => (
                  <label key={a.id}
                    className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      form.access === a.id ? "border-primary bg-primary/5" : "hover:border-primary/30")}>
                    <input type="radio" name="access" value={a.id} checked={form.access === a.id}
                      onChange={() => upd("access", a.id)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{a.l}</p>
                      <p className="text-xs text-muted-foreground">{a.d}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SEO ── */}
        {tab === "seo" && (
          <div className="grid gap-5 max-w-xl">
            <FLD label="SEO Title" hint="50-60 chars optimal">
              <Input value={form.seoTitle} onChange={e => upd("seoTitle", e.target.value)} placeholder="Best AI Prompt Pack | ScaleAIQ" />
              <p className="text-right text-[10px] text-muted-foreground">{form.seoTitle.length}/60</p>
            </FLD>
            <FLD label="Meta Description" hint="150-160 chars">
              <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={3}
                value={form.metaDesc} onChange={e => upd("metaDesc", e.target.value)} placeholder="200+ ChatGPT prompts for students..." />
              <p className="text-right text-[10px] text-muted-foreground">{form.metaDesc.length}/160</p>
            </FLD>
            <FLD label="Keywords" hint="Comma-separated">
              <Input value={form.keywords} onChange={e => upd("keywords", e.target.value)} placeholder="AI prompts, ChatGPT, students" />
            </FLD>
            <div className="rounded-xl border p-4 space-y-3">
              <p className="text-sm font-medium">Open Graph (Social Share)</p>
              <FLD label="OG Title">
                <Input value={form.ogTitle} onChange={e => upd("ogTitle", e.target.value)} placeholder="OG title for social sharing" />
              </FLD>
              <FLD label="OG Description">
                <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={2}
                  value={form.ogDesc} onChange={e => upd("ogDesc", e.target.value)} placeholder="OG description..." />
              </FLD>
            </div>
          </div>
        )}

        {/* ── UPDATES ── */}
        {tab === "updates" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{form.updates.length} Version Updates</p>
              <Button size="sm" variant="outline" onClick={addU}><Plus className="mr-1 size-3.5" />Add Version</Button>
            </div>
            {form.updates.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed py-12 text-center">
                <ChevronRight className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No version updates yet</p>
              </div>
            )}
            {form.updates.map((u, i) => (
              <div key={u.id} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Version {i + 1} {u.version && `— v${u.version}`}
                  </span>
                  <button onClick={() => delU(u.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={u.version} onChange={e => setU(u.id, "version", e.target.value)} placeholder="e.g. 2.0" />
                  <Input type="date" value={u.date} onChange={e => setU(u.id, "date", e.target.value)} />
                </div>
                <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={2}
                  value={u.notes} onChange={e => setU(u.id, "notes", e.target.value)} placeholder="Release summary..." />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium">New Features</p>
                    <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={3}
                      value={u.newFeatures} onChange={e => setU(u.id, "newFeatures", e.target.value)} placeholder="- Feature 1" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium">Bug Fixes</p>
                    <textarea className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none" rows={3}
                      value={u.bugFixes} onChange={e => setU(u.id, "bugFixes", e.target.value)} placeholder="- Fixed issue..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { l: "Views", v: "0", I: BarChart3, c: "text-violet-500", b: "bg-violet-500/10" },
                { l: "Downloads", v: "0", I: Download, c: "text-blue-500", b: "bg-blue-500/10" },
                { l: "Sales", v: "0", I: TrendingUp, c: "text-emerald-500", b: "bg-emerald-500/10" },
                { l: "Revenue", v: "INR 0", I: Star, c: "text-amber-500", b: "bg-amber-500/10" },
              ].map(s => (
                <div key={s.l} className="rounded-xl border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{s.l}</span>
                    <div className={cn("rounded-lg p-1.5", s.b)}><s.I className={cn("size-3.5", s.c)} /></div>
                  </div>
                  <p className="font-heading text-xl font-bold">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Conversion Rate</h3>
              </div>
              <p className="font-heading text-3xl font-bold">0%</p>
              <p className="mt-1 text-xs text-muted-foreground">Views to purchases ratio</p>
            </div>
            <div className="rounded-xl border border-dashed p-8 text-center">
              <BarChart3 className="mx-auto mb-2 size-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Analytics will appear once the product is published and has views.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
