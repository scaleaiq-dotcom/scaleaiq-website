import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreClient } from "@/components/explore/explore-client";
import { getCategories } from "@/lib/firebase/products";

export const revalidate = 300; // categories rarely change; products load client-side

export const metadata: Metadata = {
  title: "Explore Products — ScaleAIQ",
  description: "Browse all AI tools, courses, templates, prompts, eBooks and digital resources.",
};

export default async function ExplorePage() {
  const categories = await getCategories().catch(() => []);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Explore Products</h1>
          <p className="mt-2 text-muted-foreground">Browse our full catalog of AI tools, courses, templates and more.</p>
        </div>
        <Suspense fallback={<ExploreSkeleton />}>
          <ExploreClient categories={categories} />
        </Suspense>
      </div>
    </main>
  );
}

function ExploreSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
