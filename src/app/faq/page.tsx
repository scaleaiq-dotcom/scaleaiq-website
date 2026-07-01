import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import { FAQClient } from "@/components/faq/faq-client";

export const revalidate = 3600; // FAQs rarely change

export const metadata: Metadata = {
  title: "FAQ — ScaleAIQ",
  description: "Find answers to frequently asked questions about ScaleAIQ products, payments, downloads, and more.",
};

interface FAQ {
  id: string; question: string; answer: string;
  category: string; order: number; published: boolean;
}

async function getFAQs(): Promise<FAQ[]> {
  try {
    const snap = await adminDb.collection("faqs").where("published", "==", true).get();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as FAQ))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch { return []; }
}

export default async function FAQPage() {
  const faqs = await getFAQs();
  return <FAQClient faqs={faqs} />;
}
