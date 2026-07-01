# ScaleAIQ — Your AI & Digital Marketplace

> **Living document.** Updated as we make progress. Last updated: 2026-06-30.
> Status legend: ⬜ Not started · 🟡 In progress · ✅ Done · ⏸️ Blocked (waiting on assets/input)
>
> **Project location:** `G:\Claude Code\ScaleAIQ` (Next.js app + this plan live together here).

---

## 1. Overview

A production-ready **single-vendor digital marketplace** named **ScaleAIQ** (reference design:
SkillStore) selling courses, AI tools, templates, prompts, and eBooks to an Indian
student/creator audience. Price points: ₹49–₹999, plus FREE products.

**Core principle:** mobile-first, fast, SEO-optimized, dark/light themed, modular & reusable.

---

## 2. Locked Decisions

| Decision | Choice | Implication |
|---|---|---|
| Store model | **Single-vendor** | One admin/seller. No seller onboarding or payout splitting. |
| Product delivery | **Polymorphic** — downloads, course/video, in-app AI tools, external links, + extensible | Each product has a `deliveryType`; fulfillment is routed per type. |
| Payments | **Razorpay** | UPI, cards, netbanking, wallets. One-time + subscription support. INR. |
| Admin panel | **Yes, from day one** | Protected `/admin` with role-based access (admin claim). |

---

## 3. Tech Stack

**Frontend** *(installed versions)*
- Next.js **15.5.19** (App Router, Server Components, Server Actions) + Turbopack
- React **19.1.0**
- TypeScript (strict)
- Tailwind CSS **v4** (CSS-first config, `@theme` tokens — not v3)
- shadcn/ui — **"radix" base resolves to Base UI primitives** (`@base-ui/react`, the
  successor to Radix). Note: Base UI uses the `render` prop (not `asChild`); for buttons
  rendered as links pass `nativeButton={false}`.
- Framer Motion **v12**
- Lucide Icons **v1** — ⚠️ brand icons (Facebook/Twitter/etc.) were removed; we keep our own
  inline SVG brand icons in `src/components/icons/social.tsx`.
- next-themes (dark/light mode)

**Backend / Data**
- Firebase Authentication (email/password + Google)
- Cloud Firestore (products, orders, users, categories, reviews)
- Firebase Storage (digital files, signed access)
- Firebase Admin SDK (server-side: secure reads, custom claims, order fulfillment)

**Payments**
- Razorpay (checkout + webhook verification)

**Deployment**
- GitHub → Vercel
- Vercel for preview deploys during build (user-managed until final). Git deploy on explicit permission.

---

## 4. High-Level Architecture

```
Next.js App Router
├── (marketing)        → public pages: home, explore, category, product detail, blog
├── (auth)             → sign in / sign up / forgot password
├── (account)          → buyer dashboard: my purchases, downloads, profile
├── (admin)            → protected: products, orders, users, categories CRUD
└── api / route handlers
    ├── razorpay/order        → create order
    ├── razorpay/webhook      → verify payment, grant access, write order
    └── download/[id]         → signed URL gate (ownership check)

Firebase
├── Auth (custom claim: role=admin)
├── Firestore (security rules enforce ownership/role)
└── Storage (private bucket, served via signed URLs only)
```

**Rendering strategy**
- Home / category / product pages: **SSG + ISR** for SEO & speed.
- Account / admin: **dynamic** (auth-gated).
- Product data read at build via Admin SDK; revalidate on admin edits.

---

## 5. Data Model (Firestore) — *draft, to refine in Phase 1*

```
products/{productId}
  title, slug, description, category, tags[]
  price (number, paise or rupees TBD), isFree (bool), originalPrice (for discount)
  deliveryType: 'download' | 'course' | 'ai_tool' | 'external' | 'other'
  thumbnailUrl, gallery[]
  rating (avg), ratingCount, salesCount
  delivery: {                       // shape depends on deliveryType
    filePath?, externalUrl?, courseId?, toolSlug?
  }
  status: 'draft' | 'published'
  featured (bool), bestSeller (bool), freeThisWeek (bool)
  createdAt, updatedAt

categories/{categoryId}
  name, slug, icon, productCount, order

orders/{orderId}
  userId, items[], amount, currency
  razorpayOrderId, razorpayPaymentId, status
  createdAt

users/{uid}
  displayName, email, photoURL, role
  purchases[]   // or subcollection orders
  wishlist[]

reviews/{reviewId}
  productId, userId, rating, comment, createdAt
```

---

## 6. Build Phases & Checklist

### Phase 0 — Foundation & Setup  🟡
- [ ] Confirm assets received (see §8) — *still pending; using placeholders*
- [x] Initialize Next.js 15 + TS + Tailwind + ESLint
- [x] Install & configure shadcn/ui, Framer Motion, Lucide, next-themes
- [x] Project structure (modular folders, path aliases `@/*`)
- [x] Apply brand colors, fonts, logo, favicon → theme config *(real assets applied)*
- [x] Dark/light mode toggle working (next-themes, system default)
- [x] Base layout: header (promo bar, search, nav, cart, wishlist, auth) + footer
- [ ] Deploy skeleton to Vercel (user-managed)

**Built in Phase 0:** `src/config/site.ts` (central config), `theme-provider`, `mode-toggle`,
`logo` (real logo mark + gradient wordmark), `header`, `footer`, `icons/social` (inline brand
SVGs), `home/hero` (3-image Framer Motion carousel), branded home. Verified in light + dark, no
build errors. Dev server: `npm run dev` (port 3000).

**Typography & brand system (applied 2026-06-30):**
- Fonts: **Plus Jakarta Sans** (headings, `--font-heading`) + **Inter** (body, `--font-sans`),
  via `next/font`. Rules: fluid `text-hero`/`text-section-title` (clamp), `tracking-tight` +
  `text-balance` headings, spacious `1.6` body line-height, antialiased.
- Colors (ScaleAIQ guide) in `globals.css`: brand cyan `#00C8FF`, blue `#0066FF`, violet
  `#7B3DFF`, magenta `#D946FF`, navy `#0A0F1F`; semantic success/warning/attention/error/info.
  Dark = premium navy `#0A0F1F`; light = clean white. Primary token = violet.
- Utilities: `.bg-brand-gradient`, `.text-brand-gradient`, `.glow-violet/.glow-cyan`.
- Assets in `public/brand/`: `logo-mark.png`, `hero-marketplace/downloads/dashboard.png`,
  `categories-reference.png`, `brand-guide.png`. Originals archived in `brand-assets/_source/`.
  Favicon = `src/app/icon.png` (logo mark).

### Phase 1 — Firebase & Data Layer  ⬜
- [ ] Firebase project + Auth + Firestore + Storage setup
- [ ] Client & Admin SDK config (env vars)
- [ ] Firestore data models + TypeScript types
- [ ] Security rules (draft)
- [ ] Seed script with sample products & categories

### Phase 2 — Public Storefront (UI)  🟡
- [x] Reusable components: ProductCard, CategorySection, RatingStars, SectionHeader, Hero (carousel)
- [x] Home page (mock data): compact Hero → Featured → Popular Categories → Trending →
      Free This Week → Best Sellers (ranked) → Recently Added → Prompt Library → Why ScaleAIQ
      (+ stats) → Testimonials → Newsletter → Footer. Verified light + dark.
- [ ] Explore / all products (filter, sort, search) — *links exist; pages 404 until built*
- [ ] Category page
- [ ] Product detail page (gallery, reviews, related, buy/add-to-cart)
- [ ] SEO: metadata, OpenGraph, sitemap, structured data
- [ ] Carousel/PriceTag/Badge refinements as needed

> **Data note:** home runs on `src/lib/mock-data.ts` (typed as `Product`/`Category` to match
> future Firestore docs). Swap for live queries in Phase 1/2. `/explore`, `/category/*`,
> `/product/*` routes are linked but not built yet (will 404 if clicked).

### Phase 3 — Auth & Buyer Account  ⬜
- [ ] Sign up / sign in / Google / forgot password
- [ ] Protected routes + session handling
- [ ] Buyer dashboard: purchases, downloads, profile, wishlist

### Phase 4 — Cart & Checkout (Razorpay)  ⬜
- [ ] Cart (persisted), wishlist
- [ ] Razorpay order creation (route handler)
- [ ] Checkout flow + payment
- [ ] Webhook: verify signature → grant access → write order
- [ ] Free product instant-claim flow

### Phase 5 — Fulfillment per Delivery Type  ⬜
- [ ] Download: signed URL gate w/ ownership check
- [ ] Course/video: gated access pages
- [ ] AI tool: unlock in-app tool access
- [ ] External link: reveal after purchase
- [ ] Order confirmation + email (TBD provider)

### Phase 6 — Admin Dashboard  ⬜
- [ ] Role-based access (admin custom claim)
- [ ] Product CRUD (+ image/file upload to Storage)
- [ ] Category CRUD
- [ ] Orders view
- [ ] Users view
- [ ] Basic analytics (sales, popular products)

### Phase 7 — Polish, SEO, Performance  ⬜
- [ ] Lighthouse pass (perf, a11y, SEO, best practices)
- [ ] Image optimization, lazy loading, code splitting
- [ ] Loading / error / empty states, skeletons
- [ ] Animations (Framer Motion) refinement
- [ ] Metadata, robots.txt, sitemap finalize

### Phase 8 — Launch  ⬜
- [ ] Final QA across devices
- [ ] Firestore rules hardening + security review
- [ ] **User grants permission → push to GitHub + deploy to Vercel (production)**

---

## 7. Suggested Integrations (to consider as we go)

- **Razorpay** — payments (locked in).
- **Resend / Firebase Email** — order confirmations & receipts.
- **Canva** — for you to design product thumbnails/banners consistently.
- **Vercel Analytics / Plausible** — traffic insights.
- **Algolia / Firestore search** — fast product search if catalog grows.
- **WhatsApp share / deep links** — given your audience is on WhatsApp/Instagram.

---

## 8. Assets — status

- [x] Store name — **ScaleAIQ — Your AI & Digital Marketplace**
- [x] Logo mark (S swoosh) — `public/brand/logo-mark.png` *(dark-bg PNG; used as app-icon style)*
- [x] Favicon — `src/app/icon.png` (from logo mark)
- [x] Brand colors — full palette + semantics applied from style guide
- [x] Fonts — Plus Jakarta Sans (headings) + Inter (body)
- [x] Hero banners — 3 images in carousel (`hero-marketplace/downloads/dashboard.png`)
- [x] Category art — `categories-reference.png` (composite of 10 cards; for Phase 2)

**Still useful to have (not blocking):**
- [ ] **Transparent logo** — light + dark wordmark variants (SVG/PNG, transparent bg) for a
      cleaner header lockup than the current dark-square mark.
- [ ] Individual category icons/thumbnails (if you want them separate from the composite image).
- [ ] Dedicated OG/social-share image (1200×630) — else we auto-generate from logo + colors.

---

## 9. Progress Log

| Date | Update |
|---|---|
| 2026-06-30 | Plan created. Locked decisions: single-vendor, Razorpay, admin from day 1, polymorphic delivery. Awaiting brand assets. |
| 2026-06-30 | Store name set: **ScaleAIQ — Your AI & Digital Marketplace**. Scaffolded Next.js 15.5.19 + React 19 + Tailwind v4 + shadcn (Base UI) into `G:\Claude Code\ScaleAIQ`. Phase 0 foundation built & verified (theming, dark/light, responsive header/footer, branded home placeholder). Resolved: pinned Next 15 (installer defaulted to 16), lucide v1 brand-icon removal (inline SVGs), Base UI `nativeButton` for link buttons. |
| 2026-06-30 | **Brand + typography system applied.** Received & organized brand assets (logo, 3 hero banners, category art, style guide). Implemented Plus Jakarta Sans + Inter, full ScaleAIQ color system (dark = navy `#0A0F1F` premium look), brand gradients/glows, real logo, favicon, and a 3-image hero carousel (Framer Motion). Verified in light + dark, no build errors. |
| 2026-06-30 | **Copy + UX refinements.** Hero now a 3-banner carousel with per-slide headline/subtitle/2 CTAs (Discover…/Start Free…/Build Faster…). Mobile drawer nav rebuilt with icons (Home, Explore, AI Tools, Courses, Templates, Prompt Library, Finance, Business, Automation, Free Resources, Blog) via `siteConfig.mobileNav` — used lucide line icons (not emojis) for premium consistency. Newsletter (section + footer) → "Get Free AI Resources" / "Join Free". Site description updated to fuller marketplace copy. Added `#categories` anchor for "Browse Categories". Verified, console clean. |
| 2026-06-30 | **Storefront home built (Phase 2 UI, mock data).** Reworked to compact hero + content-dense sections per user flow: Featured → Categories → Trending → Free → Best Sellers (ranked) → Recently Added → Prompt Library → Why ScaleAIQ + stats → Testimonials → Newsletter. New: `mock-data.ts`, `types/product.ts`, `format.ts`, ProductCard, ProductGrid, CategorySection, RatingStars, SectionHeader, WhyScaleAIQ, Testimonials, Newsletter, compact Hero. 30 mock products. Verified light + dark. Next: build `/explore`, `/category`, `/product` routes; then Phase 1 Firebase to replace mock data. |
