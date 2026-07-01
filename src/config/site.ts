/**
 * Central site configuration.
 * Single source of truth for branding, metadata, navigation, and social links.
 * Update brand assets here once the real logo/colors/fonts are provided.
 */

export const siteConfig = {
  name: "ScaleAIQ",
  tagline: "Your AI & Digital Marketplace",
  description:
    "Discover AI tools, courses, templates, prompt libraries, eBooks, and digital products—all from one trusted marketplace. Choose from free resources, one-time purchases, or premium subscriptions.",
  url: "https://www.scaleaiq.in",
  ogImage: "/og.png", // placeholder — provided later
  locale: "en_IN",
  currency: "INR",
  currencySymbol: "₹",

  // Primary navigation (desktop header — text only)
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Explore", href: "/explore" },
    { title: "AI Tools", href: "/category/ai-tools" },
    { title: "Courses", href: "/category/courses" },
    { title: "Templates", href: "/category/templates" },
    { title: "Prompts", href: "/category/prompts" },
    { title: "eBooks", href: "/category/ebooks" },
    { title: "Workshops", href: "/workshops" },
    { title: "Pricing", href: "/pricing" },
    { title: "Blog", href: "/blog" },
  ],

  // Mobile drawer navigation (icon + label). `icon` = lucide icon name.
  mobileNav: [
    { title: "Home", href: "/", icon: "Home" },
    { title: "Explore", href: "/explore", icon: "Compass" },
    { title: "AI Tools", href: "/category/ai-tools", icon: "Bot" },
    { title: "Courses", href: "/category/courses", icon: "GraduationCap" },
    { title: "Templates", href: "/category/templates", icon: "LayoutTemplate" },
    { title: "Prompt Library", href: "/category/prompts", icon: "MessageSquareText" },
    { title: "Finance", href: "/category/finance", icon: "TrendingUp" },
    { title: "Business", href: "/category/business", icon: "Briefcase" },
    { title: "Automation", href: "/category/automation", icon: "Zap" },
    { title: "Free Resources", href: "/explore?price=free", icon: "Gift" },
    { title: "Workshops", href: "/workshops", icon: "Zap" },
    { title: "Pricing", href: "/pricing", icon: "TrendingUp" },
    { title: "FAQ", href: "/faq", icon: "MessageSquareText" },
    { title: "Blog", href: "/blog", icon: "Newspaper" },
  ],

  // Footer link groups
  footerNav: {
    quickLinks: [
      { title: "About Us", href: "/about" },
      { title: "All Products", href: "/explore" },
      { title: "Workshops", href: "/workshops" },
      { title: "Pricing", href: "/pricing" },
      { title: "FAQ", href: "/faq" },
      { title: "Blog", href: "/blog" },
      { title: "Contact Us", href: "/contact" },
    ],
    categories: [
      { title: "AI Tools", href: "/category/ai-tools" },
      { title: "Courses", href: "/category/courses" },
      { title: "Templates", href: "/category/templates" },
      { title: "Prompts", href: "/category/prompts" },
      { title: "eBooks", href: "/category/ebooks" },
    ],
    support: [
      { title: "Help Center", href: "/help" },
      { title: "FAQ", href: "/faq" },
      { title: "Terms of Use", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Refund Policy", href: "/refund" },
      { title: "Contact Support", href: "/contact" },
    ],
  },

  social: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    youtube: "#",
    linkedin: "#",
  },
} as const;

export type SiteConfig = typeof siteConfig;
