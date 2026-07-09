import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/admin";

const BASE = "https://www.scaleaiq.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/explore`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/faq`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  ];

  // Product pages
  let product_pages: MetadataRoute.Sitemap = [];
  try {
    const snap = await adminDb
      .collection("products")
      .where("status", "in", ["published", "coming_soon"])
      .get();
    product_pages = snap.docs.map(d => ({
      url: `${BASE}/product/${d.data().slug ?? d.id}`,
      lastModified: d.data().updatedAt?.toDate?.() ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch { /* fail silently — sitemap degrades to static pages */ }

  // Category pages
  let category_pages: MetadataRoute.Sitemap = [];
  try {
    const snap = await adminDb.collection("categories").get();
    category_pages = snap.docs.map(d => ({
      url: `${BASE}/category/${d.data().slug ?? d.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch { /* fail silently */ }

  return [...static_pages, ...product_pages, ...category_pages];
}
