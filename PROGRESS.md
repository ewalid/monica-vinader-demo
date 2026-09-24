# Monica Vinader Demo — Build Progress

Demo date: 2026-09-29 (board decision 2026-09-30)
Storyblok space: 295438895232893 ("Monica Vinader")

## Completed

### Step 3 — Shopify Product Seeding
- [x] Dev store created: monica-vinader-demo.myshopify.com
- [x] 36 products seeded across 6 categories (14K Gold, Siren Diamond, Gold Vermeil, Silver, Men's, Charms)
- [x] 11 smart collections created
- [x] Prices set (GBP) via productVariantsBulkUpdate
- [x] Metafields: material, care_instructions, sustainability
- [ ] Product images (Step 4 — pending)
- [ ] Multi-currency markets (US/USD, EU/EUR, UAE/AED — manual in Shopify admin)

### Step 1 — Repo Setup
- [x] SE showcase template copied into project
- [x] Bug fixes applied: VWO init guard, ExperimentationVwo getFlag guard, VideoPlayer defineProps
- [x] nuxt.config.ts adapted (env var mapping, Akeneo removed)
- [x] Dependencies installed, dev server verified
- [x] MV branding: Cormorant Garamond + Work Sans fonts, gold/cream color palette

### Step 2 — Component Library (Storyblok schemas + Vue files)
- [x] 10 MV-specific components created in Storyblok:
  - mv-announcement-bar, mv-announcement-message
  - mv-hero-banner
  - mv-product-grid
  - mv-category-card, mv-category-grid
  - mv-trust-bar, mv-trust-item
  - mv-editorial-section
  - mv-collection-hero
- [x] Matching Vue files for all 10 components
- [x] Existing SE showcase components inherited (hero-section, text-section, grid-section, etc.)

## Next

### Step 4 — Product Images
- Download hero images from MV CDN
- Upload to Shopify products

### Step 5 — Page Building
- Create homepage story with MV components
- Create collection pages
- Wire up navigation / site-config
- Verify Visual Editor

### Step 6 — Multi-market / i18n / RTL
### Step 7 — Constructor & Bloomreach mocks
### Step 8 — Workflows, roles, releases
### Step 9 — Agent system prompt
### Step 10 — Vercel deploy, design polish
### Step 11 — Scenario verification
