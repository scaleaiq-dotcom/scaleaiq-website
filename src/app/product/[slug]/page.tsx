import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByCategory } from "@/lib/firebase/products";
import { ProductDetail } from "@/components/product/product-detail";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product Not Found — ScaleAIQ" };
  return {
    title: `${product.title} — ScaleAIQ`,
    description: product.shortDescription || product.description,
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description,
      // Product image, falling back to the brand banner so WhatsApp/social
      // previews always show something.
      images: [product.thumbnailUrl || "/brand/hero-marketplace.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription || product.description,
      images: [product.thumbnailUrl || "/brand/hero-marketplace.png"],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  // Related: same category, exclude self, in-memory filter to avoid composite index
  const categoryProducts = await getProductsByCategory(product.category, 12).catch(() => []);
  const related = categoryProducts.filter(p => p.id !== product.id).slice(0, 6);

  return <ProductDetail product={product} related={related} />;
}
