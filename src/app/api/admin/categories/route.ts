import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

const DEFAULT_CATS = [
  { name: "AI Tools", slug: "ai-tools", icon: "Bot", order: 1 },
  { name: "Courses", slug: "courses", icon: "GraduationCap", order: 2 },
  { name: "Finance", slug: "finance", icon: "TrendingUp", order: 3 },
  { name: "Business", slug: "business", icon: "Briefcase", order: 4 },
  { name: "Prompt Library", slug: "prompts", icon: "MessageSquareText", order: 5 },
  { name: "Templates", slug: "templates", icon: "LayoutTemplate", order: 6 },
  { name: "Free Resources", slug: "free", icon: "Gift", order: 7 },
  { name: "Automation", slug: "automation", icon: "Zap", order: 8 },
  { name: "Design", slug: "design", icon: "Palette", order: 9 },
  { name: "Image Bundles", slug: "images", icon: "Images", order: 10 },
];

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let catsSnap = await adminDb.collection("categories").orderBy("order").get();

  // Seed defaults once if collection is empty
  if (catsSnap.empty) {
    const batch = adminDb.batch();
    DEFAULT_CATS.forEach(cat => {
      const ref = adminDb.collection("categories").doc();
      batch.set(ref, { ...cat, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
    await batch.commit();
    catsSnap = await adminDb.collection("categories").orderBy("order").get();
  }

  const [, productsSnap] = await Promise.all([
    Promise.resolve(),
    adminDb.collection("products").get(),
  ]);

  // Count products per category
  const counts: Record<string, number> = {};
  productsSnap.docs.forEach(d => {
    const cat = d.data().category as string | undefined;
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1;
  });

  const categories = catsSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    productCount: counts[d.data().name as string] ?? 0,
  }));

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const ref = await adminDb.collection("categories").add({
    name: body.name,
    slug: body.slug,
    icon: body.icon ?? "Tag",
    order: body.order ?? 999,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}

