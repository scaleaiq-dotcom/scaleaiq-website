import type { Timestamp } from "firebase/firestore";

export type DeliveryType =
  | "download"
  | "course"
  | "ai_tool"
  | "external"
  | "prompt"
  | "ebook"
  | "template";

export type PricingType = "free" | "one_time" | "subscription" | "coming_soon";

export type ProductStatus = "draft" | "published" | "coming_soon" | "archived";

export interface ProductDelivery {
  filePath?: string;
  externalUrl?: string;
  courseId?: string;
  toolSlug?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Timestamp | Date;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;

  // Media
  thumbnailUrl: string;
  images: string[];
  videoUrl?: string;

  // Classification
  category: string;
  categoryLabel: string;
  subcategory?: string;
  tags: string[];

  // Pricing
  price: number;
  originalPrice?: number;
  pricingType: PricingType;

  // Delivery
  deliveryType: DeliveryType;
  delivery: ProductDelivery;

  // Creator
  creatorName: string;
  creatorAvatar?: string;

  // Stats
  rating: number;
  ratingCount: number;
  downloadCount: number;
  salesCount: number;

  // Flags
  featured: boolean;
  bestSeller: boolean;
  trending: boolean;
  freeThisWeek: boolean;

  // Meta
  version?: string;
  status: ProductStatus;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;

  // Legacy gradient (used as fallback when no thumbnailUrl)
  gradient?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl?: string;
  imagePosition?: string;
  accentColor?: string;
  iconBgSize?: string;
  iconBgPos?: string;
  description?: string;
  productCount: number;
  order: number;
}

export interface ProductFilters {
  category?: string;
  pricingType?: PricingType | "all";
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sort?: "newest" | "popular" | "price_asc" | "price_desc" | "rating";
  search?: string;
  status?: ProductStatus;
}
