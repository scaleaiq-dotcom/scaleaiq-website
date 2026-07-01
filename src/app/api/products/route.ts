import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const pricing  = searchParams.get("pricing")  ?? "all";
  const sort     = searchParams.get("sort")      ?? "newest";
  const search   = searchParams.get("search")    ?? "";
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "24"), 100);

  try {
    let q: FirebaseFirestore.Query = adminDb
      .collection("products")
      .where("status", "==", "published");

    if (category && category !== "all") {
      q = q.where("category", "==", category);
    }

    // Fetch more than needed so we can filter+sort in-memory without composite indexes
    const snap = await q.limit(limit * 3).get();

    let products = snap.docs.map(d => {
      const data = d.data();
      return {
        id:               d.id,
        slug:             data.slug            ?? d.id,
        title:            data.title           ?? "",
        description:      data.description     ?? data.shortDesc ?? "",
        shortDescription: data.shortDescription ?? data.shortDesc ?? "",
        categoryLabel:    data.categoryLabel   ?? data.productType ?? "",
        category:         data.category        ?? "",
        tags:             data.tags            ?? [],
        price:            data.price           ?? 0,
        originalPrice:    data.originalPrice,
        pricingType:      data.pricingType     ?? (data.price === 0 ? "free" : "one_time"),
        deliveryType:     data.deliveryType    ?? "download",
        delivery:         data.delivery        ?? {},
        thumbnailUrl:     data.thumbnailUrl    ?? data.thumbnail ?? "",
        images:           data.images          ?? [],
        gradient:         data.gradient,
        rating:           data.rating          ?? 0,
        ratingCount:      data.ratingCount     ?? 0,
        salesCount:       data.salesCount      ?? 0,
        downloadCount:    data.downloadCount   ?? 0,
        featured:         data.featured        ?? false,
        bestSeller:       data.bestSeller      ?? false,
        trending:         data.trending        ?? false,
        freeThisWeek:     data.freeThisWeek    ?? false,
        isNew:            data.isNew           ?? false,
        status:           data.status          ?? "published",
        creatorName:      data.creatorName     ?? "ScaleAIQ",
        createdAt:        data.createdAt?.toDate?.() ?? new Date(),
        updatedAt:        data.updatedAt?.toDate?.() ?? new Date(),
      };
    });

    // Price filter
    if (pricing === "free") {
      products = products.filter(p => p.price === 0 || p.pricingType === "free");
    } else if (pricing === "paid") {
      products = products.filter(p => p.price > 0);
    }

    // Search filter (title + tags + categoryLabel)
    if (search.trim()) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sort) {
      case "popular":   products.sort((a, b) => b.salesCount - a.salesCount); break;
      case "rating":    products.sort((a, b) => b.rating - a.rating); break;
      case "price_asc": products.sort((a, b) => a.price - b.price); break;
      case "price_desc":products.sort((a, b) => b.price - a.price); break;
      case "trending":  products = products.filter(p => p.trending); break;
      case "featured":  products = products.filter(p => p.featured); break;
      case "newest":
      default:
        products.sort((a, b) => {
          const at = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const bt = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return bt - at;
        });
    }

    return NextResponse.json({ products: products.slice(0, limit), total: products.length });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ products: [], total: 0 });
  }
}
