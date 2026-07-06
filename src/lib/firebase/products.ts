import { cache } from "react";
import { adminDb } from "./admin";
import type { Product, Category, ProductFilters } from "@/types/product";

const PRODUCTS_COL = "products";
const CATEGORIES_COL = "categories";

function prettify(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Normalise a multi-file Experience list; fall back to the legacy single URL
// so products saved before multi-file support keep working.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function expList(stored: any, legacyUrl?: string): { id: string; title: string; url: string }[] {
  if (Array.isArray(stored)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = stored.filter((r: any) => r?.url).map((r: any, i: number) => ({
      id: String(r.id ?? i), title: String(r.title ?? ""), url: String(r.url),
    }));
    if (rows.length) return rows;
  }
  return legacyUrl ? [{ id: "legacy", title: "", url: legacyUrl }] : [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToProduct(id: string, data: Record<string, any>): Product {
  // The admin editor saves `price`/`salePrice` as strings; the public side uses
  // `price` (selling price) + `originalPrice` (struck-through).
  const regular = Number(data.price) || 0;
  const sale = Number(data.salePrice) || 0;
  const hasSale = sale > 0 && sale < regular;
  const isFree = (data.pricingType ?? "") === "free";
  const sellPrice = isFree ? 0 : hasSale ? sale : regular;
  const strikePrice = hasSale
    ? regular
    : data.originalPrice != null
      ? Number(data.originalPrice)
      : undefined;

  // External-app / external-URL products: editor stores the link as `launchUrl`.
  const externalUrl =
    data.launchUrl ?? data.externalUrl ?? data.delivery?.externalUrl ?? "";
  const isExternal =
    data.launchType === "External URL" ||
    data.productType === "External App" ||
    data.pricingType === "external";

  return {
    id,
    slug: data.slug ?? id,
    title: data.title ?? "",
    // Editor field names (fullDesc/shortDesc/thumbnail) fall back to public names.
    description: data.description ?? data.fullDesc ?? "",
    shortDescription: data.shortDescription ?? data.shortDesc ?? "",
    thumbnailUrl: data.thumbnailUrl ?? data.thumbnail ?? "",
    images: data.images ?? [data.heroBanner, data.thumbnail].filter(Boolean),
    videoUrl: data.videoUrl ?? data.pvUrl,
    category: data.category ?? "",
    categoryLabel: data.categoryLabel ?? prettify(data.category ?? ""),
    subcategory: data.subcategory,
    tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    price: sellPrice,
    originalPrice: strikePrice,
    pricingType: data.pricingType ?? "free",
    deliveryType: data.deliveryType ?? (isExternal ? "external" : "download"),
    delivery: data.delivery ?? (externalUrl ? { externalUrl } : {}),
    creatorName: data.creatorName ?? "ScaleAIQ",
    creatorAvatar: data.creatorAvatar,
    rating: data.rating ?? 0,
    ratingCount: data.ratingCount ?? 0,
    downloadCount: data.downloadCount ?? 0,
    salesCount: data.salesCount ?? 0,
    featured: data.featured ?? false,
    bestSeller: data.bestSeller ?? false,
    trending: data.trending ?? false,
    freeThisWeek: data.freeThisWeek ?? false,
    version: data.version,
    status: data.status ?? "published",
    launchType: data.launchType,
    externalUrl,
    access: data.access ?? "public",
    gradient: data.gradient,
    // Experience features from editor
    pvEnabled: data.pvEnabled ?? false,
    pvUrl: data.pvUrl ?? "",
    pvVideos: expList(data.pvVideos, data.pvUrl),
    pdfEnabled: data.pdfEnabled ?? false,
    pdfPages: data.pdfPages ?? "",
    pdfUrl: data.pdfUrl ?? "",
    pdfFiles: expList(data.pdfFiles, data.pdfUrl),
    sampleEnabled: data.sampleEnabled ?? false,
    sampleUrl: data.sampleUrl ?? "",
    sampleFiles: expList(data.sampleFiles, data.sampleUrl),
    demoEnabled: data.demoEnabled ?? false,
    demoUrl: data.demoUrl ?? "",
    demoMode: data.demoMode ?? "tab",
    extDemoEnabled: data.extDemoEnabled ?? false,
    extDemoUrl: data.extDemoUrl ?? "",
    // eBook: preview EPUB is public; the full book URL is never exposed here —
    // only a boolean, so buyers get it through /api/ebook-url after purchase.
    epubEnabled: data.epubEnabled ?? false,
    previewEpubUrl: data.previewEpubUrl ?? "",
    hasEpub: !!data.epubUrl,
    galleryEnabled: data.galleryEnabled ?? false,
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
    freeEnabled: data.freeEnabled ?? false,
    freeLabel: data.freeLabel ?? "",
    freeDescription: data.freeDescription ?? "",
    freeFiles: Array.isArray(data.freeFiles) ? data.freeFiles : [],
    // Bundle contents — file URLs stripped: delivery happens post-purchase only
    downloads: Array.isArray(data.downloads)
      ? data.downloads.map((d: Record<string, unknown>) => ({
          id: d.id, type: d.type ?? "Other", title: d.title ?? "",
          description: d.description ?? "", version: d.version ?? "", order: d.order ?? 0,
        }))
      : [],
    // Tutorials — video URL only exposed for Free Preview items
    tutorials: Array.isArray(data.tutorials)
      ? data.tutorials.map((t: Record<string, unknown>) => ({
          id: t.id, title: t.title ?? "", duration: t.duration ?? "",
          description: t.description ?? "", free: t.free ?? false, order: t.order ?? 0,
          ...(t.free ? { videoUrl: t.videoUrl ?? "" } : {}),
        }))
      : [],
    updates: Array.isArray(data.updates) ? data.updates : [],
    features: data.features ?? "",
    benefits: data.benefits ?? "",
    requirements: data.requirements ?? "",
    audience: data.audience ?? "",
    included: data.included ?? "",
    docUrl: data.docUrl ?? "",
    githubUrl: data.githubUrl ?? "",
    websiteUrl: data.websiteUrl ?? "",
    communityUrl: data.communityUrl ?? "",
    supportEmail: data.supportEmail ?? "",
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
  } as Product;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToCategory(id: string, data: Record<string, any>): Category {
  return {
    id,
    name: data.name ?? "",
    slug: data.slug ?? id,
    icon: data.icon ?? "Box",
    imageUrl: data.imageUrl,
    description: data.description,
    productCount: data.productCount ?? 0,
    order: data.order ?? 0,
  };
}

export async function getFeaturedProducts(count = 10): Promise<Product[]> {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("featured", "==", true)
    .limit(count)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published");
}

export async function getTrendingProducts(count = 10): Promise<Product[]> {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("trending", "==", true)
    .limit(count)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published")
    .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
}

export async function getFreeThisWeekProducts(count = 10): Promise<Product[]> {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("freeThisWeek", "==", true)
    .limit(count)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published");
}

export async function getBestSellerProducts(count = 10): Promise<Product[]> {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("bestSeller", "==", true)
    .limit(count)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published")
    .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
}

export async function getRecentProducts(count = 10): Promise<Product[]> {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("status", "==", "published")
    .limit(count * 2)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published" || p.status === "coming_soon")
    // createdAt is an ISO string at runtime — the old instanceof Date check never matched
    .sort((a, b) => {
      const t = (x: Product) => typeof x.createdAt === "string" ? Date.parse(x.createdAt) || 0 : 0;
      return t(b) - t(a);
    })
    .slice(0, count);
}

// cache(): generateMetadata and the page body both call these during one
// request — without it every product/category view hits Firestore twice.
export const getProductsByCategory = cache(async (
  categorySlug: string,
  count = 20
): Promise<Product[]> => {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("category", "==", categorySlug)
    .limit(count)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published" || p.status === "coming_soon");
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToProduct(d.id, d.data());
});

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await adminDb.collection(PRODUCTS_COL).doc(id).get();
  if (!snap.exists) return null;
  return docToProduct(snap.id, snap.data()!);
}

export async function getRelatedProducts(
  product: Product,
  count = 6
): Promise<Product[]> {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("category", "==", product.category)
    .where("status", "==", "published")
    .orderBy("rating", "desc")
    .limit(count + 1)
    .get();
  return snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter((p) => p.id !== product.id)
    .slice(0, count);
}

export async function getPublishedProducts(
  filters: ProductFilters = {},
  pageSize = 24
): Promise<Product[]> {
  // Use simple single-field queries to avoid needing composite indexes
  let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb
    .collection(PRODUCTS_COL)
    .where("status", "==", "published");

  if (filters.category) {
    q = q.where("category", "==", filters.category);
  }

  const snap = await q.limit(pageSize * 2).get();
  let results = snap.docs
    .map((d) => docToProduct(d.id, d.data()))
    .filter(p => p.status === "published" || p.status === "coming_soon");

  // Filter by pricing in memory
  if (filters.pricingType && filters.pricingType !== "all") {
    results = results.filter(p => p.pricingType === filters.pricingType);
  }

  // Sort in memory
  if (filters.sort === "price_asc") {
    results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (filters.sort === "price_desc") {
    results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  } else if (filters.sort === "rating") {
    results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (filters.sort === "popular") {
    results.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
  }

  return results.slice(0, pageSize);
}

/**
 * Homepage data in a single products query.
 * One catalog scan replaces six separate flag-filtered queries.
 */
export async function getHomeProducts(perSection = 8) {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .where("status", "in", ["published", "coming_soon"])
    .limit(300)
    .get();
  const all = snap.docs.map((d) => docToProduct(d.id, d.data()));
  const published = all.filter((p) => p.status === "published");

  const bySales = (a: Product, b: Product) => (b.salesCount ?? 0) - (a.salesCount ?? 0);
  const time = (x: Product) =>
    typeof x.createdAt === "string" ? Date.parse(x.createdAt as string) || 0
    : x.createdAt instanceof Date ? x.createdAt.getTime() : 0;

  // Live product count per category (stored counts are never maintained)
  const categoryCounts: Record<string, number> = {};
  for (const p of all) {
    if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
  }

  return {
    categoryCounts,
    featured: published.filter((p) => p.featured).slice(0, perSection),
    trending: published.filter((p) => p.trending).sort(bySales).slice(0, perSection),
    freeThisWeek: published.filter((p) => p.freeThisWeek).slice(0, perSection),
    topSellers: published.filter((p) => p.bestSeller).sort(bySales).slice(0, perSection),
    recent: [...all].sort((a, b) => time(b) - time(a)).slice(0, perSection),
    prompts: all.filter((p) => p.category === "prompts").slice(0, perSection),
  };
}

export async function getProductReviews(productId: string) {
  const snap = await adminDb
    .collection(PRODUCTS_COL)
    .doc(productId)
    .collection("reviews")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const snap = await adminDb
    .collection(CATEGORIES_COL)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((d) => docToCategory(d.id, d.data()));
});

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const snap = await adminDb
    .collection(CATEGORIES_COL)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToCategory(d.id, d.data());
}
