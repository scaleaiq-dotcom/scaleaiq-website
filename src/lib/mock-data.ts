import type { Category, Product } from "@/types/product";

/**
 * MOCK DATA — shown while Firebase is not yet configured.
 * Shapes exactly match Firestore Product/Category documents.
 * Replace home-page queries with Firestore calls once credentials are in .env.local.
 */

const NOW = new Date();

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

let _n = 0;
const nextId = () => `mock-${++_n}`;

function make(
  p: Partial<Product> & Pick<Product, "title" | "category" | "categoryLabel">
): Product {
  return {
    id: nextId(),
    slug: p.slug ?? p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    description: p.description ?? p.title,
    shortDescription: p.shortDescription ?? p.title,
    thumbnailUrl: p.thumbnailUrl ?? "",
    images: p.images ?? [],
    tags: p.tags ?? [],
    pricingType: p.price === 0 ? "free" : "one_time",
    deliveryType: p.deliveryType ?? "download",
    delivery: p.delivery ?? {},
    creatorName: p.creatorName ?? "ScaleAIQ",
    downloadCount: p.downloadCount ?? 0,
    salesCount: p.salesCount ?? 0,
    status: p.status ?? "published",
    featured: p.featured ?? false,
    bestSeller: p.bestSeller ?? false,
    trending: p.trending ?? false,
    freeThisWeek: p.freeThisWeek ?? false,
    rating: p.rating ?? 4.5,
    ratingCount: p.ratingCount ?? 0,
    price: p.price ?? 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...p,
  };
}

export const featuredProducts: Product[] = [
  make({ title: "AI Image Generator Pro", categoryLabel: "AI Tool", category: "ai-tools", deliveryType: "ai_tool", price: 0, rating: 4.8, ratingCount: 245, gradient: G.violet, featured: true }),
  make({ title: "Excel Mastery Bundle", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 499, rating: 4.9, ratingCount: 128, gradient: G.green, featured: true }),
  make({ title: "1000+ ChatGPT Prompts", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 199, rating: 4.7, ratingCount: 312, gradient: G.cyan, featured: true }),
  make({ title: "Stock Market Masterclass", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 999, rating: 4.8, ratingCount: 186, gradient: G.slate, featured: true }),
  make({ title: "Canva Design Templates", categoryLabel: "Template", category: "templates", deliveryType: "template", price: 0, rating: 4.6, ratingCount: 98, gradient: G.orange, featured: true }),
];

export const trendingProducts: Product[] = [
  make({ title: "Notion Productivity OS", categoryLabel: "Template", category: "templates", deliveryType: "template", price: 299, rating: 4.9, ratingCount: 204, gradient: G.indigo, trending: true }),
  make({ title: "Midjourney Prompt Pack", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 149, rating: 4.8, ratingCount: 167, gradient: G.magenta, trending: true }),
  make({ title: "Full-Stack Web Dev 2026", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 1299, rating: 4.9, ratingCount: 421, gradient: G.blue, trending: true }),
  make({ title: "AI Voice Cloning Tool", categoryLabel: "AI Tool", category: "ai-tools", deliveryType: "ai_tool", price: 599, rating: 4.7, ratingCount: 89, gradient: G.violet, trending: true }),
  make({ title: "Instagram Growth Kit", categoryLabel: "eBook", category: "ebooks", deliveryType: "ebook", price: 99, rating: 4.6, ratingCount: 142, gradient: G.orange, trending: true }),
];

export const freeResources: Product[] = [
  make({ title: "Expense Tracker Excel Template", categoryLabel: "Template", category: "templates", deliveryType: "template", price: 0, rating: 4.7, ratingCount: 52, gradient: G.green, freeThisWeek: true }),
  make({ title: "AI Resume Builder Tool", categoryLabel: "AI Tool", category: "ai-tools", deliveryType: "ai_tool", price: 0, rating: 4.8, ratingCount: 74, gradient: G.violet, freeThisWeek: true }),
  make({ title: "500+ Social Media Post Templates", categoryLabel: "Template", category: "templates", deliveryType: "template", price: 0, rating: 4.6, ratingCount: 63, gradient: G.cyan, freeThisWeek: true }),
  make({ title: "ChatGPT for Beginners Guide", categoryLabel: "eBook", category: "ebooks", deliveryType: "ebook", price: 0, rating: 4.9, ratingCount: 105, gradient: G.slate, freeThisWeek: true }),
  make({ title: "YouTube Title Generator Tool", categoryLabel: "AI Tool", category: "ai-tools", deliveryType: "ai_tool", price: 0, rating: 4.7, ratingCount: 88, gradient: G.blue, freeThisWeek: true }),
];

export const bestSellers: Product[] = [
  make({ title: "Complete Python Bootcamp 2026", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 799, rating: 4.9, ratingCount: 256, gradient: G.blue, bestSeller: true }),
  make({ title: "Advanced Excel Formulas Mastery", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 599, rating: 4.8, ratingCount: 199, gradient: G.green, bestSeller: true }),
  make({ title: "AI Content Writing Masterclass", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 499, rating: 4.7, ratingCount: 147, gradient: G.slate, bestSeller: true }),
  make({ title: "Affiliate Marketing A to Z", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 999, rating: 4.6, ratingCount: 128, gradient: G.orange, bestSeller: true }),
  make({ title: "Data Science Bootcamp Python", categoryLabel: "Course", category: "courses", deliveryType: "course", price: 1299, rating: 4.8, ratingCount: 165, gradient: G.indigo, bestSeller: true }),
];

export const recentlyAdded: Product[] = [
  make({ title: "Claude AI Power-User Guide", categoryLabel: "eBook", category: "ebooks", deliveryType: "ebook", price: 149, rating: 4.9, ratingCount: 31, gradient: G.violet }),
  make({ title: "SaaS Landing Page Templates", categoryLabel: "Template", category: "templates", deliveryType: "template", price: 399, rating: 4.7, ratingCount: 18, gradient: G.cyan }),
  make({ title: "Personal Finance Planner", categoryLabel: "Template", category: "templates", deliveryType: "template", price: 99, rating: 4.8, ratingCount: 24, gradient: G.green }),
  make({ title: "AI Video Editor Pro", categoryLabel: "AI Tool", category: "ai-tools", deliveryType: "ai_tool", price: 699, rating: 4.6, ratingCount: 12, gradient: G.magenta }),
  make({ title: "Cold Email Sales Scripts", categoryLabel: "eBook", category: "ebooks", deliveryType: "ebook", price: 199, rating: 4.7, ratingCount: 27, gradient: G.slate }),
];

export const promptLibrary: Product[] = [
  make({ title: "Marketing Prompt Vault", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 249, rating: 4.8, ratingCount: 92, gradient: G.magenta }),
  make({ title: "Coding Assistant Prompts", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 199, rating: 4.9, ratingCount: 134, gradient: G.blue }),
  make({ title: "Image Gen Prompt Mega Pack", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 149, rating: 4.7, ratingCount: 78, gradient: G.violet }),
  make({ title: "Business Strategy Prompts", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 0, rating: 4.6, ratingCount: 61, gradient: G.cyan }),
  make({ title: "Study & Exam Prep Prompts", categoryLabel: "Prompt", category: "prompts", deliveryType: "prompt", price: 99, rating: 4.8, ratingCount: 110, gradient: G.green }),
];

// Sprite positions from categories-reference.png
// Row 1 (5 cards): AI Tools | Courses | Finance | Business | Prompt Library
// Row 2 (4 cards centered): Templates | Free Resources | Automation | Design & Creativity
export const categories: Category[] = [
  { id: "cat-1", name: "AI Tools",       slug: "ai-tools",   icon: "Bot",               productCount: 120, order: 1, accentColor: "#00c8ff", iconBgSize: "500% 200%", iconBgPos: "0% 0%" },
  { id: "cat-2", name: "Courses",        slug: "courses",    icon: "GraduationCap",     productCount: 200, order: 2, accentColor: "#7b3dff", iconBgSize: "500% 200%", iconBgPos: "25% 0%" },
  { id: "cat-3", name: "Finance",        slug: "finance",    icon: "TrendingUp",        productCount: 80,  order: 3, accentColor: "#22c55e", iconBgSize: "500% 200%", iconBgPos: "50% 0%" },
  { id: "cat-4", name: "Business",       slug: "business",   icon: "Briefcase",         productCount: 90,  order: 4, accentColor: "#0066ff", iconBgSize: "500% 200%", iconBgPos: "75% 0%" },
  { id: "cat-5", name: "Prompt Library", slug: "prompts",    icon: "MessageSquareText", productCount: 90,  order: 5, accentColor: "#d946ff", iconBgSize: "500% 200%", iconBgPos: "100% 0%" },
  { id: "cat-6", name: "Templates",      slug: "templates",  icon: "LayoutTemplate",    productCount: 150, order: 6, accentColor: "#0066ff", iconBgSize: "400% 200%", iconBgPos: "0% 100%" },
  { id: "cat-7", name: "Free Resources", slug: "free",       icon: "Gift",              productCount: 60,  order: 7, accentColor: "#f59e0b", iconBgSize: "400% 200%", iconBgPos: "33% 100%" },
  { id: "cat-8", name: "Automation",     slug: "automation", icon: "Zap",               productCount: 70,  order: 8, accentColor: "#7b3dff", iconBgSize: "400% 200%", iconBgPos: "67% 100%" },
  { id: "cat-9", name: "Design",         slug: "design",     icon: "Palette",           productCount: 60,  order: 9, accentColor: "#f97316", iconBgSize: "400% 200%", iconBgPos: "100% 100%" },
];

export const testimonials = [
  { name: "Aarav Sharma", role: "Student, Delhi", quote: "ScaleAIQ's prompt packs and AI tools saved me hours every week. Everything is affordable and works instantly.", initials: "AS" },
  { name: "Priya Nair", role: "Content Creator", quote: "The templates are genuinely premium. I bought the Canva bundle and my Instagram engagement doubled.", initials: "PN" },
  { name: "Rahul Verma", role: "Freelancer, Pune", quote: "One-time payment, lifetime access, UPI checkout. Exactly what I wanted. The course quality is top-notch.", initials: "RV" },
];

export const stats = [
  { value: "10K+", label: "Happy Users" },
  { value: "500+", label: "Products" },
  { value: "50K+", label: "Orders Completed" },
  { value: "4.8/5", label: "Average Rating" },
  { value: "24/7", label: "Support" },
];
