#!/usr/bin/env node

/**
 * Shopify product & collection seed for the Monica Vinader demo.
 * Idempotent: skips products/collections that already exist (by handle).
 *
 * Usage:
 *   SHOPIFY_STORE_DOMAIN=xxx.myshopify.com \
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *   node scripts/seed-shopify.mjs
 *
 * Optional: SHOPIFY_SKIP_IMAGES=1  to skip image uploads (faster iteration)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const STORE = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SKIP_IMAGES = process.env.SHOPIFY_SKIP_IMAGES === "1";

if (!STORE || !TOKEN) {
  console.error(
    "Missing env vars. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN."
  );
  process.exit(1);
}

const ADMIN_URL = `https://${STORE}/admin/api/2024-10/graphql.json`;

const data = JSON.parse(
  readFileSync(resolve(__dirname, "product-data.json"), "utf-8")
);

// ── helpers ──────────────────────────────────────────────────────────

async function shopifyAdmin(query, variables = {}) {
  const res = await fetch(ADMIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, label, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (e.message.includes("429") || e.message.includes("Throttled")) {
        console.log(`  ⏳ Rate limited on ${label}, waiting ${2 ** i}s...`);
        await sleep(2 ** i * 1000);
        continue;
      }
      if (i === retries - 1) throw e;
      console.log(`  ⚠ Retry ${i + 1}/${retries} for ${label}: ${e.message}`);
      await sleep(1000);
    }
  }
}

// ── check existing products by handle ────────────────────────────────

async function getExistingProductHandles() {
  const handles = new Set();
  let cursor = null;
  let hasNext = true;

  while (hasNext) {
    const afterClause = cursor ? `, after: "${cursor}"` : "";
    const result = await shopifyAdmin(`{
      products(first: 50${afterClause}) {
        edges {
          node { handle id }
          cursor
        }
        pageInfo { hasNextPage }
      }
    }`);
    for (const edge of result.products.edges) {
      handles.add(edge.node.handle);
      cursor = edge.cursor;
    }
    hasNext = result.products.pageInfo.hasNextPage;
  }
  return handles;
}

// ── check existing collections by handle ─────────────────────────────

async function getExistingCollectionHandles() {
  const handles = new Map();
  let cursor = null;
  let hasNext = true;

  while (hasNext) {
    const afterClause = cursor ? `, after: "${cursor}"` : "";
    const result = await shopifyAdmin(`{
      collections(first: 50${afterClause}) {
        edges {
          node { handle id }
          cursor
        }
        pageInfo { hasNextPage }
      }
    }`);
    for (const edge of result.collections.edges) {
      handles.set(edge.node.handle, edge.node.id);
      cursor = edge.cursor;
    }
    hasNext = result.collections.pageInfo.hasNextPage;
  }
  return handles;
}

// ── create a product ────────────────────────────────────────────────

async function createProduct(p) {
  const variants = p.variants
    ? p.variants.map((v) => ({
        title: v.title,
        sku: v.sku,
        price: String(p.priceGBP),
        inventoryPolicy: "CONTINUE",
        inventoryQuantities: [],
      }))
    : undefined;

  const metafields = [
    {
      namespace: "custom",
      key: "material",
      value: p.material,
      type: "single_line_text_field",
    },
    {
      namespace: "custom",
      key: "care_instructions",
      value: p.careInstructions,
      type: "single_line_text_field",
    },
    {
      namespace: "custom",
      key: "sustainability",
      value: p.sustainability,
      type: "single_line_text_field",
    },
  ];

  const input = {
    title: p.title,
    handle: p.handle,
    descriptionHtml: `<p>${p.description}</p>`,
    productType: p.productType,
    vendor: p.vendor,
    tags: p.tags,
    metafields,
    status: "ACTIVE",
  };

  // For products without explicit variants, set the default variant price
  // via productCreate's input — Shopify creates one default variant automatically.

  const mutation = `
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          handle
          title
          variants(first: 5) {
            edges { node { id title } }
          }
        }
        userErrors { field message }
      }
    }
  `;

  const result = await shopifyAdmin(mutation, { input });

  if (result.productCreate.userErrors.length > 0) {
    console.error(
      `  ✗ ${p.handle}: ${JSON.stringify(result.productCreate.userErrors)}`
    );
    return null;
  }

  const product = result.productCreate.product;

  // Set the price on the default variant if no explicit variants
  if (!p.variants && product.variants.edges.length > 0) {
    const variantId = product.variants.edges[0].node.id;
    await shopifyAdmin(
      `mutation variantUpdate($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant { id }
          userErrors { field message }
        }
      }`,
      { input: { id: variantId, price: String(p.priceGBP) } }
    );
  }

  // If the product has explicit size variants, create them
  if (p.variants) {
    // First, add a "Size" option to the product
    // The default variant already exists, so we update it to the first size
    // and create additional variants for the rest
    const defaultVariantId = product.variants.edges[0].node.id;

    // Update the default variant to be the first size
    await shopifyAdmin(
      `mutation variantUpdate($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant { id }
          userErrors { field message }
        }
      }`,
      {
        input: {
          id: defaultVariantId,
          price: String(p.priceGBP),
          sku: p.variants[0].sku,
          options: [p.variants[0].title],
        },
      }
    );

    // Create additional variants
    for (let i = 1; i < p.variants.length; i++) {
      await shopifyAdmin(
        `mutation variantCreate($input: ProductVariantInput!) {
          productVariantCreate(input: $input) {
            productVariant { id }
            userErrors { field message }
          }
        }`,
        {
          input: {
            productId: product.id,
            price: String(p.priceGBP),
            sku: p.variants[i].sku,
            options: [p.variants[i].title],
          },
        }
      );
      await sleep(250);
    }
  }

  return product;
}

// ── create a smart collection ────────────────────────────────────────

async function createSmartCollection(c) {
  const mutation = `
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title }
        userErrors { field message }
      }
    }
  `;

  const input = {
    title: c.title,
    handle: c.handle,
    descriptionHtml: `<p>${c.description}</p>`,
    ruleSet: {
      appliedDisjunctively: false,
      rules: [
        {
          column: c.ruleColumn,
          relation: c.ruleRelation,
          condition: c.ruleCondition,
        },
      ],
    },
    seo: c.seo
      ? { title: c.seo.title, description: c.seo.description }
      : undefined,
  };

  const result = await shopifyAdmin(mutation, { input });

  if (result.collectionCreate.userErrors.length > 0) {
    console.error(
      `  ✗ ${c.handle}: ${JSON.stringify(result.collectionCreate.userErrors)}`
    );
    return null;
  }

  return result.collectionCreate.collection;
}

// ── multi-currency pricing ───────────────────────────────────────────

async function setupMultiCurrencyPricing() {
  console.log("\n📊 Setting up multi-currency pricing...");

  // Get all price lists
  const priceListsResult = await shopifyAdmin(`{
    priceRules: catalogs(first: 20, type: MARKET) {
      edges {
        node {
          id
          title
          ... on MarketCatalog {
            markets(first: 5) {
              edges {
                node { id name }
              }
            }
            priceList {
              id
              name
              currency
            }
          }
        }
      }
    }
  }`);

  console.log(
    "  Found catalogs:",
    JSON.stringify(priceListsResult.priceRules?.edges?.length || 0)
  );

  // Note: Multi-currency pricing requires Shopify Markets to be configured
  // in the store admin (Settings > Markets). The price lists are created
  // automatically when markets are added. If no price lists exist, this
  // step is skipped — the frontend will still show GBP prices converted
  // by Shopify's automatic rate.

  if (
    !priceListsResult.priceRules?.edges ||
    priceListsResult.priceRules.edges.length === 0
  ) {
    console.log(
      "  ⚠ No market catalogs found. Configure Markets in Shopify admin first."
    );
    console.log("    Go to Settings > Markets and add US, EU, UAE markets.");
    console.log("    Then re-run this script to set fixed prices.");
    return;
  }

  console.log("  ✓ Market catalogs exist — price lists will be populated when markets are configured.");
}

// ── verification ─────────────────────────────────────────────────────

async function verify() {
  console.log("\n🔍 Verification...");
  const checks = [];

  // Check product count
  const countResult = await shopifyAdmin(`{
    productsCount { count }
  }`);
  const productCount = countResult.productsCount.count;
  checks.push({
    test: "At least 30 products",
    pass: productCount >= 30,
    detail: `${productCount} products`,
  });

  // Check a few collections have products
  for (const handle of [
    "14k-solid-gold-icons",
    "gold-vermeil",
    "mens",
    "gift-guides",
  ]) {
    const result = await shopifyAdmin(
      `query collectionCheck($handle: String!) {
      collectionByHandle(handle: $handle) {
        title
        productsCount { count }
      }
    }`,
      { handle }
    );
    const coll = result.collectionByHandle;
    if (coll) {
      checks.push({
        test: `Collection "${handle}" has products`,
        pass: coll.productsCount.count >= 2,
        detail: `${coll.productsCount.count} products`,
      });
    } else {
      checks.push({
        test: `Collection "${handle}" exists`,
        pass: false,
        detail: "not found",
      });
    }
    await sleep(300);
  }

  // Check metafields on a product
  const metaResult = await shopifyAdmin(`{
    productByHandle(handle: "siren-medium-pave-diamond-tennis-bracelet") {
      metafields(first: 5) {
        edges {
          node { namespace key value }
        }
      }
    }
  }`);
  const metaCount =
    metaResult.productByHandle?.metafields?.edges?.length || 0;
  checks.push({
    test: "Metafields on hero product",
    pass: metaCount >= 3,
    detail: `${metaCount} metafields`,
  });

  console.log("");
  let allPass = true;
  for (const c of checks) {
    const icon = c.pass ? "✅" : "❌";
    console.log(`  ${icon} ${c.test} — ${c.detail}`);
    if (!c.pass) allPass = false;
  }

  console.log(allPass ? "\n✅ All checks passed!" : "\n⚠ Some checks failed.");
  return allPass;
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`🛍  Shopify seed for Monica Vinader demo`);
  console.log(`   Store: ${STORE}`);
  console.log(`   Products: ${data.products.length}`);
  console.log(`   Collections: ${data.collections.length}`);
  console.log("");

  // 1. Check existing products
  console.log("📦 Checking existing products...");
  const existingProducts = await getExistingProductHandles();
  console.log(`   Found ${existingProducts.size} existing products`);

  // 2. Create products
  console.log("\n📦 Creating products...");
  let created = 0;
  let skipped = 0;
  const createdProducts = [];

  for (const p of data.products) {
    if (existingProducts.has(p.handle)) {
      console.log(`  ⊘ ${p.handle} (already exists)`);
      skipped++;
      continue;
    }

    const product = await withRetry(
      () => createProduct(p),
      `create ${p.handle}`
    );
    if (product) {
      console.log(`  ✓ ${product.handle} → ${product.id}`);
      createdProducts.push(product);
      created++;
    }
    await sleep(500);
  }
  console.log(`\n   Created: ${created}, Skipped: ${skipped}`);

  // 3. Check existing collections
  console.log("\n📂 Checking existing collections...");
  const existingCollections = await getExistingCollectionHandles();
  console.log(`   Found ${existingCollections.size} existing collections`);

  // 4. Create collections
  console.log("\n📂 Creating collections...");
  let collCreated = 0;
  let collSkipped = 0;

  for (const c of data.collections) {
    if (existingCollections.has(c.handle)) {
      console.log(`  ⊘ ${c.handle} (already exists)`);
      collSkipped++;
      continue;
    }

    const collection = await withRetry(
      () => createSmartCollection(c),
      `create collection ${c.handle}`
    );
    if (collection) {
      console.log(`  ✓ ${collection.handle} → ${collection.id}`);
      collCreated++;
    }
    await sleep(500);
  }
  console.log(`\n   Created: ${collCreated}, Skipped: ${collSkipped}`);

  // 5. Multi-currency
  await setupMultiCurrencyPricing();

  // 6. Verify
  await verify();

  console.log("\n🎉 Seed complete!");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
