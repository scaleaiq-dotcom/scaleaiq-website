/**
 * Run: node scripts/seed-firestore.mjs
 * Seeds Firestore with categories. Run once after Firebase is configured.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")];
    })
);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const categories = [
  { id: "ai-tools",   name: "AI Tools",       slug: "ai-tools",   icon: "Bot",                accentColor: "#00c8ff", order: 1, productCount: 0, description: "Discover powerful AI tools to supercharge your workflow" },
  { id: "courses",    name: "Courses",         slug: "courses",    icon: "GraduationCap",      accentColor: "#7b3dff", order: 2, productCount: 0, description: "Learn from expert-led courses on business, tech, and more" },
  { id: "finance",    name: "Finance",         slug: "finance",    icon: "TrendingUp",         accentColor: "#22c55e", order: 3, productCount: 0, description: "Tools, templates and courses for trading and investing" },
  { id: "business",   name: "Business",        slug: "business",   icon: "Briefcase",          accentColor: "#0066ff", order: 4, productCount: 0, description: "Resources to start, grow, and scale your business" },
  { id: "prompts",    name: "Prompt Library",  slug: "prompts",    icon: "MessageSquareText",  accentColor: "#d946ff", order: 5, productCount: 0, description: "Ready-to-use AI prompts for ChatGPT, Midjourney, and more" },
  { id: "templates",  name: "Templates",       slug: "templates",  icon: "LayoutTemplate",     accentColor: "#0066ff", order: 6, productCount: 0, description: "Professionally designed templates for Notion, Excel, Canva" },
  { id: "free",       name: "Free Resources",  slug: "free",       icon: "Gift",               accentColor: "#f59e0b", order: 7, productCount: 0, description: "High-quality free resources — no payment required" },
  { id: "automation", name: "Automation",      slug: "automation", icon: "Zap",                accentColor: "#7b3dff", order: 8, productCount: 0, description: "Automations and workflows to save hours every week" },
  { id: "design",     name: "Design",          slug: "design",     icon: "Palette",            accentColor: "#f97316", order: 9, productCount: 0, description: "Fonts, UI kits, icons, and design resources" },
];

async function seed() {
  console.log("🌱 Seeding Firestore...\n");

  const batch = db.batch();

  for (const cat of categories) {
    const ref = db.collection("categories").doc(cat.id);
    batch.set(ref, { ...cat, createdAt: new Date(), updatedAt: new Date() }, { merge: true });
    console.log(`  ✅ Category: ${cat.name}`);
  }

  await batch.commit();
  console.log("\n✅ Seed complete! Categories added to Firestore.");
  console.log("🔗 View at: https://console.firebase.google.com/project/scaleaiq-4e4af/firestore");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
