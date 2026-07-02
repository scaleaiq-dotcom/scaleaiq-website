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

/** Downloadable file shown on the product page. `file` URL is stripped for public display. */
export interface ProductFile {
  id: string;
  type: string;
  title: string;
  description?: string;
  version?: string;
  /** Only present in purchase/delivery contexts — never on the public product page. */
  file?: string;
  order?: number;
}

export interface ProductTutorial {
  id: string;
  title: string;
  duration?: string;
  description?: string;
  /** Only present when the tutorial is marked Free Preview. */
  videoUrl?: string;
  free?: boolean;
  order?: number;
}

export interface ProductUpdate {
  id: string;
  version: string;
  notes?: string;
  newFeatures?: string;
  bugFixes?: string;
  date?: string;
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

  // External launch (for "External App" / "External URL" products)
  launchType?: string;
  externalUrl?: string;

  // Access mode from editor Access tab: public | login_required | purchase_required | subscription_required
  access?: string;

  // Experience features (set in admin editor)
  pvEnabled?: boolean;
  pvUrl?: string;
  pdfEnabled?: boolean;
  pdfPages?: string;
  sampleEnabled?: boolean;
  sampleUrl?: string;
  demoEnabled?: boolean;
  demoUrl?: string;
  demoMode?: string;
  extDemoEnabled?: boolean;
  extDemoUrl?: string;

  // Bundle contents & learning material (from editor tabs — sanitized for public display)
  downloads?: ProductFile[];
  tutorials?: ProductTutorial[];
  updates?: ProductUpdate[];

  // Content tab (newline-separated lists in the editor)
  features?: string;
  benefits?: string;
  requirements?: string;
  audience?: string;
  included?: string;

  // Resources tab
  docUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  communityUrl?: string;
  supportEmail?: string;

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
