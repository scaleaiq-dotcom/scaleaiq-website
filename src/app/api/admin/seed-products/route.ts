import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function requireAdmin(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const decoded = await (await getAdminAuth()).verifySessionCookie(session, true);
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
    if (!adminEmails.includes(decoded.email ?? "")) return null;
    return decoded;
  } catch { return null; }
}

const G = {
  blue: "from-blue-600 to-indigo-700",
  green: "from-emerald-600 to-teal-700",
  violet: "from-violet-600 to-fuchsia-700",
  orange: "from-orange-500 to-rose-600",
  cyan: "from-cyan-500 to-blue-600",
  slate: "from-slate-700 to-slate-900",
  magenta: "from-fuchsia-600 to-pink-600",
  indigo: "from-indigo-600 to-violet-700",
};

function slug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const SEED_PRODUCTS = [
  // Featured
  { title: "AI Image Generator Pro", category: "ai-tools", categoryLabel: "AI Tool", deliveryType: "ai_tool", price: 0, pricingType: "free", rating: 4.8, ratingCount: 245, gradient: G.violet, featured: true, status: "published" },
  { title: "Excel Mastery Bundle", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 499, pricingType: "one_time", rating: 4.9, ratingCount: 128, gradient: G.green, featured: true, status: "published" },
  { title: "1000+ ChatGPT Prompts", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 199, pricingType: "one_time", rating: 4.7, ratingCount: 312, gradient: G.cyan, featured: true, status: "published" },
  { title: "Stock Market Masterclass", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 999, pricingType: "one_time", rating: 4.8, ratingCount: 186, gradient: G.slate, featured: true, status: "published" },
  { title: "Canva Design Templates", category: "templates", categoryLabel: "Template", deliveryType: "template", price: 0, pricingType: "free", rating: 4.6, ratingCount: 98, gradient: G.orange, featured: true, status: "published" },
  // Trending
  { title: "Notion Productivity OS", category: "templates", categoryLabel: "Template", deliveryType: "template", price: 299, pricingType: "one_time", rating: 4.9, ratingCount: 204, gradient: G.indigo, trending: true, status: "published" },
  { title: "Midjourney Prompt Pack", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 149, pricingType: "one_time", rating: 4.8, ratingCount: 167, gradient: G.magenta, trending: true, status: "published" },
  { title: "Full-Stack Web Dev 2026", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 1299, pricingType: "one_time", rating: 4.9, ratingCount: 421, gradient: G.blue, trending: true, status: "published" },
  { title: "AI Voice Cloning Tool", category: "ai-tools", categoryLabel: "AI Tool", deliveryType: "ai_tool", price: 599, pricingType: "one_time", rating: 4.7, ratingCount: 89, gradient: G.violet, trending: true, status: "published" },
  { title: "Instagram Growth Kit", category: "ebooks", categoryLabel: "eBook", deliveryType: "ebook", price: 99, pricingType: "one_time", rating: 4.6, ratingCount: 142, gradient: G.orange, trending: true, status: "published" },
  // Free This Week
  { title: "Expense Tracker Excel Template", category: "templates", categoryLabel: "Template", deliveryType: "template", price: 0, pricingType: "free", rating: 4.7, ratingCount: 52, gradient: G.green, freeThisWeek: true, status: "published" },
  { title: "AI Resume Builder Tool", category: "ai-tools", categoryLabel: "AI Tool", deliveryType: "ai_tool", price: 0, pricingType: "free", rating: 4.8, ratingCount: 74, gradient: G.violet, freeThisWeek: true, status: "published" },
  { title: "500+ Social Media Post Templates", category: "templates", categoryLabel: "Template", deliveryType: "template", price: 0, pricingType: "free", rating: 4.6, ratingCount: 63, gradient: G.cyan, freeThisWeek: true, status: "published" },
  { title: "ChatGPT for Beginners Guide", category: "ebooks", categoryLabel: "eBook", deliveryType: "ebook", price: 0, pricingType: "free", rating: 4.9, ratingCount: 105, gradient: G.slate, freeThisWeek: true, status: "published" },
  { title: "YouTube Title Generator Tool", category: "ai-tools", categoryLabel: "AI Tool", deliveryType: "ai_tool", price: 0, pricingType: "free", rating: 4.7, ratingCount: 88, gradient: G.blue, freeThisWeek: true, status: "published" },
  // Best Sellers
  { title: "Complete Python Bootcamp 2026", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 799, pricingType: "one_time", rating: 4.9, ratingCount: 256, gradient: G.blue, bestSeller: true, status: "published" },
  { title: "Advanced Excel Formulas Mastery", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 599, pricingType: "one_time", rating: 4.8, ratingCount: 199, gradient: G.green, bestSeller: true, status: "published" },
  { title: "AI Content Writing Masterclass", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 499, pricingType: "one_time", rating: 4.7, ratingCount: 147, gradient: G.slate, bestSeller: true, status: "published" },
  { title: "Affiliate Marketing A to Z", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 999, pricingType: "one_time", rating: 4.6, ratingCount: 128, gradient: G.orange, bestSeller: true, status: "published" },
  { title: "Data Science Bootcamp Python", category: "courses", categoryLabel: "Course", deliveryType: "course", price: 1299, pricingType: "one_time", rating: 4.8, ratingCount: 165, gradient: G.indigo, bestSeller: true, status: "published" },
  // Recently Added
  { title: "Claude AI Power-User Guide", category: "ebooks", categoryLabel: "eBook", deliveryType: "ebook", price: 149, pricingType: "one_time", rating: 4.9, ratingCount: 31, gradient: G.violet, isNew: true, status: "published" },
  { title: "SaaS Landing Page Templates", category: "templates", categoryLabel: "Template", deliveryType: "template", price: 399, pricingType: "one_time", rating: 4.7, ratingCount: 18, gradient: G.cyan, isNew: true, status: "published" },
  { title: "Personal Finance Planner", category: "templates", categoryLabel: "Template", deliveryType: "template", price: 99, pricingType: "one_time", rating: 4.8, ratingCount: 24, gradient: G.green, isNew: true, status: "published" },
  { title: "AI Video Editor Pro", category: "ai-tools", categoryLabel: "AI Tool", deliveryType: "ai_tool", price: 699, pricingType: "one_time", rating: 4.6, ratingCount: 12, gradient: G.magenta, isNew: true, status: "published" },
  { title: "Cold Email Sales Scripts", category: "ebooks", categoryLabel: "eBook", deliveryType: "ebook", price: 199, pricingType: "one_time", rating: 4.7, ratingCount: 27, gradient: G.slate, isNew: true, status: "published" },
  // Prompt Library
  { title: "Marketing Prompt Vault", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 249, pricingType: "one_time", rating: 4.8, ratingCount: 92, gradient: G.magenta, status: "published" },
  { title: "Coding Assistant Prompts", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 199, pricingType: "one_time", rating: 4.9, ratingCount: 134, gradient: G.blue, status: "published" },
  { title: "Image Gen Prompt Mega Pack", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 149, pricingType: "one_time", rating: 4.7, ratingCount: 78, gradient: G.violet, status: "published" },
  { title: "Business Strategy Prompts", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 0, pricingType: "free", rating: 4.6, ratingCount: 61, gradient: G.cyan, status: "published" },
  { title: "Study & Exam Prep Prompts", category: "prompts", categoryLabel: "Prompt", deliveryType: "prompt", price: 99, pricingType: "one_time", rating: 4.8, ratingCount: 110, gradient: G.green, status: "published" },
];

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check existing slugs to avoid duplicates
  const existing = await adminDb.collection("products").get();
  const existingSlugs = new Set(existing.docs.map(d => d.data().slug as string));

  const batch = adminDb.batch();
  let added = 0;
  let skipped = 0;

  for (const p of SEED_PRODUCTS) {
    const productSlug = slug(p.title);
    if (existingSlugs.has(productSlug)) { skipped++; continue; }

    const ref = adminDb.collection("products").doc();
    batch.set(ref, {
      title: p.title,
      slug: productSlug,
      category: p.category,
      categoryLabel: p.categoryLabel,
      shortDesc: p.title,
      fullDesc: "",
      description: p.title,
      shortDescription: p.title,
      productType: p.categoryLabel,
      deliveryType: p.deliveryType,
      delivery: {},
      status: p.status,
      price: p.price,
      pricingType: p.pricingType,
      currency: "INR",
      rating: p.rating,
      ratingCount: p.ratingCount,
      salesCount: Math.floor(p.ratingCount * 1.5),
      downloadCount: Math.floor(p.ratingCount * 2),
      featured: p.featured ?? false,
      trending: p.trending ?? false,
      bestSeller: p.bestSeller ?? false,
      freeThisWeek: p.freeThisWeek ?? false,
      isNew: p.isNew ?? false,
      comingSoon: false,
      gradient: p.gradient,
      tags: [],
      thumbnail: "",
      thumbnailUrl: "",
      creatorName: "ScaleAIQ",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    added++;
  }

  await batch.commit();
  return NextResponse.json({ ok: true, added, skipped });
}

