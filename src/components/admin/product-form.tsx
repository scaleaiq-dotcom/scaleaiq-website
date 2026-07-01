"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload, X, Loader2, Plus, GripVertical, FileUp,
  ImageIcon, Video, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PricingType = "free" | "one_time" | "subscription" | "coming_soon";
type DeliveryType = "download" | "course" | "ai_tool" | "external" | "prompt" | "ebook" | "template";
type ProductStatus = "draft" | "published" | "coming_soon" | "archived";

interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string;
  price: string;
  originalPrice: string;
  pricingType: PricingType;
  deliveryType: DeliveryType;
  deliveryUrl: string;
  videoUrl: string;
  creatorName: string;
  version: string;
  status: ProductStatus;
  featured: boolean;
  bestSeller: boolean;
  trending: boolean;
  freeThisWeek: boolean;
}

const defaultForm: FormState = {
  title: "", slug: "", shortDescription: "", description: "",
  category: "", subcategory: "", tags: "",
  price: "", originalPrice: "",
  pricingType: "one_time", deliveryType: "download",
  deliveryUrl: "", videoUrl: "",
  creatorName: "ScaleAIQ", version: "",
  status: "draft",
  featured: false, bestSeller: false, trending: false, freeThisWeek: false,
};

const categories = [
  { value: "ai-tools", label: "AI Tools" },
  { value: "courses", label: "Courses" },
  { value: "finance", label: "Finance" },
  { value: "business", label: "Business" },
  { value: "prompts", label: "Prompt Library" },
  { value: "templates", label: "Templates" },
  { value: "free", label: "Free Resources" },
  { value: "automation", label: "Automation" },
  { value: "design", label: "Design" },
];

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(defaultForm);
  const [images, setImages] = React.useState<{ file?: File; url: string; uploading?: boolean }[]>([]);
  const [thumbnail, setThumbnail] = React.useState<{ file?: File; url: string } | null>(null);
  const [deliveryFile, setDeliveryFile] = React.useState<{ file?: File; url: string; name: string } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const imgInputRef = React.useRef<HTMLInputElement>(null);
  const thumbInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleThumb(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setThumbnail({ file, url });
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newImgs = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs]);
  }

  function handleDeliveryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDeliveryFile({ file, url: "", name: file.name });
  }

  async function uploadToStorage(file: File, path: string): Promise<string> {
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const { storage } = await import("@/lib/firebase/client");
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async function handleSave(publish = false) {
    if (!form.title) { setError("Title is required."); return; }
    if (!form.category) { setError("Category is required."); return; }
    setError("");
    setSaving(true);
    try {
      const { collection, addDoc, doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase/client");

      let thumbnailUrl = "";
      let deliveryUrl = form.deliveryUrl;
      const galleryUrls: string[] = [];
      const slug = form.slug || autoSlug(form.title);

      // Upload thumbnail
      if (thumbnail?.file) {
        thumbnailUrl = await uploadToStorage(thumbnail.file, `products/${slug}/thumbnail-${Date.now()}`);
      }

      // Upload gallery images
      for (const img of images) {
        if (img.file) {
          const url = await uploadToStorage(img.file, `products/${slug}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}`);
          galleryUrls.push(url);
        } else {
          galleryUrls.push(img.url);
        }
      }

      // Upload delivery file
      if (deliveryFile?.file) {
        deliveryUrl = await uploadToStorage(deliveryFile.file, `products/${slug}/delivery-${deliveryFile.name}`);
      }

      const status: ProductStatus = publish ? "published" : form.status;
      const data = {
        title: form.title,
        slug,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category,
        categoryLabel: categories.find(c => c.value === form.category)?.label ?? form.category,
        subcategory: form.subcategory,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        price: parseFloat(form.price) || 0,
        originalPrice: parseFloat(form.originalPrice) || 0,
        pricingType: form.pricingType,
        deliveryType: form.deliveryType,
        delivery: { type: form.deliveryType, url: deliveryUrl },
        thumbnailUrl,
        images: galleryUrls,
        videoUrl: form.videoUrl,
        creatorName: form.creatorName,
        version: form.version,
        status,
        featured: form.featured,
        bestSeller: form.bestSeller,
        trending: form.trending,
        freeThisWeek: form.freeThisWeek,
        rating: 0, ratingCount: 0, downloadCount: 0, salesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (productId) {
        await updateDoc(doc(db, "products", productId), { ...data, createdAt: undefined });
      } else {
        await addDoc(collection(db, "products"), data);
      }

      setSuccess(publish ? "Product published!" : "Draft saved!");
      setTimeout(() => router.push("/admin/products"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main */}
      <div className="space-y-6">

        {/* Basic Info */}
        <Section title="Basic Information">
          <Field label="Product Title *">
            <Input
              placeholder="e.g. 1000+ ChatGPT Prompts Bundle"
              value={form.title}
              onChange={e => { set("title", e.target.value); if (!form.slug) set("slug", autoSlug(e.target.value)); }}
            />
          </Field>
          <Field label="URL Slug">
            <Input
              placeholder="auto-generated from title"
              value={form.slug}
              onChange={e => set("slug", e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">scaleaiq.com/product/{form.slug || "auto-generated"}</p>
          </Field>
          <Field label="Short Description (shown in cards)">
            <Input
              placeholder="One-liner that sells the product"
              value={form.shortDescription}
              onChange={e => set("shortDescription", e.target.value)}
            />
          </Field>
          <Field label="Full Description">
            <textarea
              rows={6}
              placeholder="Detailed description — features, what's included, who it's for..."
              value={form.description}
              onChange={e => set("description", e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
          </Field>
        </Section>

        {/* Thumbnail */}
        <Section title="Thumbnail Image">
          <p className="mb-3 text-xs text-muted-foreground">Main image shown on product cards. Recommended: 800×600px, JPG/PNG/WebP</p>
          <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
          {thumbnail ? (
            <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border">
              <Image src={thumbnail.url} alt="Thumbnail" fill className="object-cover" />
              <button
                onClick={() => setThumbnail(null)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => thumbInputRef.current?.click()}
              className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <ImageIcon className="size-8 opacity-40" />
              <span className="text-sm">Click to upload thumbnail</span>
            </button>
          )}
          {!thumbnail && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => thumbInputRef.current?.click()}>
              <Upload className="mr-2 size-3.5" /> Upload Thumbnail
            </Button>
          )}
        </Section>

        {/* Gallery */}
        <Section title="Product Gallery">
          <p className="mb-3 text-xs text-muted-foreground">Additional screenshots or preview images (up to 10)</p>
          <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border">
                <Image src={img.url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                <button
                  onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex"
                >
                  <X className="size-3" />
                </button>
                <div className="absolute bottom-1 left-1 hidden cursor-grab text-white group-hover:flex">
                  <GripVertical className="size-3.5 opacity-70" />
                </div>
              </div>
            ))}
            {images.length < 10 && (
              <button
                onClick={() => imgInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
              >
                <Plus className="size-5 opacity-50" />
                <span className="text-[10px]">Add</span>
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => imgInputRef.current?.click()}>
            <ImageIcon className="mr-2 size-3.5" /> Add Images
          </Button>
        </Section>

        {/* Video */}
        <Section title="Product Video (Optional)">
          <Field label="Video URL (YouTube / Vimeo embed URL)">
            <Input
              placeholder="https://www.youtube.com/embed/..."
              value={form.videoUrl}
              onChange={e => set("videoUrl", e.target.value)}
            />
          </Field>
          {form.videoUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border">
              <iframe src={form.videoUrl} className="aspect-video w-full" allowFullScreen />
            </div>
          )}
        </Section>

        {/* Delivery File */}
        <Section title="Delivery File">
          <p className="mb-3 text-xs text-muted-foreground">Upload the file buyers will receive after purchase (PDF, ZIP, MP4, etc.)</p>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleDeliveryFile} />
          {deliveryFile ? (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
              <FileUp className="size-5 shrink-0 text-primary" />
              <span className="flex-1 truncate text-sm font-medium">{deliveryFile.name}</span>
              <button onClick={() => setDeliveryFile(null)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="mr-2 size-4" /> Upload Delivery File
            </Button>
          )}
          <div className="mt-3">
            <Field label="Or paste a delivery URL">
              <Input
                placeholder="https://... (Google Drive, Notion, etc.)"
                value={form.deliveryUrl}
                onChange={e => set("deliveryUrl", e.target.value)}
              />
            </Field>
          </div>
        </Section>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">

        {/* Status */}
        <SidePanel title="Status">
          <SelectField
            label="Product Status"
            value={form.status}
            onChange={v => set("status", v as ProductStatus)}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
              { value: "coming_soon", label: "Coming Soon" },
              { value: "archived", label: "Archived" },
            ]}
          />
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => handleSave(true)} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Publish"}
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              Save Draft
            </Button>
          </div>
          {error && <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
          {success && <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">{success}</p>}
        </SidePanel>

        {/* Pricing */}
        <SidePanel title="Pricing">
          {/* Pricing type selector */}
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "free", label: "Free", desc: "₹0" },
              { value: "one_time", label: "One-time", desc: "₹49–149" },
              { value: "subscription", label: "Subscription", desc: "₹299/mo" },
              { value: "coming_soon", label: "Coming Soon", desc: "No price" },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { set("pricingType", opt.value); if (opt.value === "free") set("price", "0"); if (opt.value === "subscription") set("price", "299"); }}
                className={cn(
                  "flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors",
                  form.pricingType === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "hover:border-muted-foreground/30"
                )}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
              </button>
            ))}
          </div>

          {/* One-time price tiers */}
          {form.pricingType === "one_time" && (
            <div>
              <label className="mb-2 block text-sm font-medium">Select Price Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {[49, 99, 149].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("price", String(p))}
                    className={cn(
                      "rounded-lg border py-2.5 text-center transition-colors",
                      form.price === String(p)
                        ? "border-primary bg-primary text-primary-foreground font-bold"
                        : "hover:border-muted-foreground/40"
                    )}
                  >
                    <span className="text-sm font-semibold">₹{p}</span>
                  </button>
                ))}
              </div>
              {form.price && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">₹{form.price} one-time</span>
                </p>
              )}
            </div>
          )}

          {/* Subscription — fixed ₹299/month */}
          {form.pricingType === "subscription" && (
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">₹299 / month</span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Coming Soon</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Per-tool subscription. Razorpay recurring setup needed before publishing.</p>
            </div>
          )}

          {/* Free */}
          {form.pricingType === "free" && (
            <div className="rounded-lg bg-emerald-500/10 p-3 text-sm">
              <span className="font-semibold text-emerald-600">Free download</span>
              <p className="mt-0.5 text-xs text-muted-foreground">No payment required. Anyone can download.</p>
            </div>
          )}

          {/* Coming Soon */}
          {form.pricingType === "coming_soon" && (
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <span className="font-semibold">Coming Soon overlay</span>
              <p className="mt-0.5 text-xs text-muted-foreground">Product is visible but not purchasable yet. Shows a "Notify Me" button.</p>
            </div>
          )}
        </SidePanel>

        {/* Category */}
        <SidePanel title="Category & Type">
          <SelectField
            label="Category *"
            value={form.category}
            onChange={v => set("category", v)}
            options={[{ value: "", label: "Select category..." }, ...categories]}
          />
          <Field label="Subcategory (optional)">
            <Input placeholder="e.g. ChatGPT, Excel" value={form.subcategory} onChange={e => set("subcategory", e.target.value)} />
          </Field>
          <SelectField
            label="Delivery Type"
            value={form.deliveryType}
            onChange={v => set("deliveryType", v as DeliveryType)}
            options={[
              { value: "download", label: "Download" },
              { value: "course", label: "Course" },
              { value: "ai_tool", label: "AI Tool" },
              { value: "prompt", label: "Prompt" },
              { value: "ebook", label: "eBook" },
              { value: "template", label: "Template" },
              { value: "external", label: "External Link" },
            ]}
          />
          <Field label="Tags (comma separated)">
            <Input placeholder="AI, ChatGPT, productivity" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </Field>
        </SidePanel>

        {/* Creator */}
        <SidePanel title="Creator">
          <Field label="Creator Name">
            <Input placeholder="ScaleAIQ" value={form.creatorName} onChange={e => set("creatorName", e.target.value)} />
          </Field>
          <Field label="Version (optional)">
            <Input placeholder="v1.0" value={form.version} onChange={e => set("version", e.target.value)} />
          </Field>
        </SidePanel>

        {/* Badges */}
        <SidePanel title="Badges & Labels">
          {([
            ["featured", "Featured"],
            ["bestSeller", "Best Seller"],
            ["trending", "Trending"],
            ["freeThisWeek", "Free This Week"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between py-1">
              <span className="text-sm">{label}</span>
              <button
                type="button"
                onClick={() => set(key, !form[key])}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  form[key] ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span className={cn("size-4 rounded-full bg-white shadow transition-transform", form[key] ? "translate-x-4" : "translate-x-0.5")} />
              </button>
            </label>
          ))}
        </SidePanel>

        {/* Preview link */}
        {form.slug && (
          <a
            href={`/product/${form.slug || autoSlug(form.title)}`}
            target="_blank"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="size-3" /> Preview product page
          </a>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
