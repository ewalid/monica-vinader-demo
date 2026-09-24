#!/usr/bin/env node
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const data = JSON.parse(readFileSync(resolve(__dirname, "product-data.json"), "utf-8"));

async function gql(query, variables = {}) {
  const res = await fetch(ADMIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log("Fixing prices for all MV products...\n");
  let fixed = 0, skipped = 0, failed = 0;

  for (const p of data.products) {
    const result = await gql(`query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id title
        variants(first: 10) { edges { node { id title price } } }
      }
    }`, { handle: p.handle });

    const product = result.productByHandle;
    if (!product) {
      console.log(`  ⊘ ${p.handle} — not found`);
      failed++;
      continue;
    }

    const variants = product.variants.edges.map(e => e.node);
    const needsPrice = variants.some(v => v.price === "0.00");
    const hasSizeVariants = p.variants && p.variants.length > 1;
    const currentlyHasSizes = variants.length > 1 || (variants[0] && variants[0].title !== "Default Title");

    if (needsPrice) {
      const variantUpdates = variants.map(v => ({
        id: v.id,
        price: String(p.priceGBP),
      }));

      const updateResult = await gql(`
        mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants { id price }
            userErrors { field message }
          }
        }
      `, { productId: product.id, variants: variantUpdates });

      if (updateResult.productVariantsBulkUpdate.userErrors.length > 0) {
        console.log(`  ✗ ${p.handle}: ${JSON.stringify(updateResult.productVariantsBulkUpdate.userErrors)}`);
        failed++;
      } else {
        console.log(`  ✓ ${p.handle} — price set to £${p.priceGBP}`);
        fixed++;
      }
    } else {
      console.log(`  ⊘ ${p.handle} — price already correct`);
      skipped++;
    }

    if (hasSizeVariants && !currentlyHasSizes) {
      // Create size variants using optionValues (new product model)
      const newVariants = p.variants.slice(1).map(v => ({
        price: String(p.priceGBP),
        sku: v.sku,
        optionValues: [{ optionName: "Size", name: v.title }],
      }));

      // Rename default variant to first size
      try {
        await gql(`
          mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              productVariants { id }
              userErrors { field message }
            }
          }
        `, {
          productId: product.id,
          variants: [{ id: variants[0].id, optionValues: [{ optionName: "Size", name: p.variants[0].title }] }],
        });

        if (newVariants.length > 0) {
          const createResult = await gql(`
            mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
              productVariantsBulkCreate(productId: $productId, variants: $variants) {
                productVariants { id title }
                userErrors { field message }
              }
            }
          `, { productId: product.id, variants: newVariants });

          if (createResult.productVariantsBulkCreate.userErrors.length > 0) {
            console.log(`    ⚠ Sizes: ${JSON.stringify(createResult.productVariantsBulkCreate.userErrors)}`);
          } else {
            console.log(`    + Added ${createResult.productVariantsBulkCreate.productVariants.length} size variants`);
          }
        }
      } catch (e) {
        console.log(`    ⚠ Size variants skipped: ${e.message.slice(0, 100)}`);
      }
    }

    await sleep(400);
  }

  console.log(`\nFixed: ${fixed}, Skipped: ${skipped}, Failed: ${failed}`);

  // Verify
  const check = await gql(`{
    bracelet: productByHandle(handle: "siren-medium-pave-diamond-tennis-bracelet") {
      title variants(first: 1) { edges { node { price } } }
    }
    ring: productByHandle(handle: "siren-diamond-eternity-ring") {
      title variants(first: 5) { edges { node { title price } } }
    }
  }`);
  console.log("\nVerification:");
  console.log("  Bracelet price:", "£" + check.bracelet.variants.edges[0].node.price);
  console.log("  Ring variants:", check.ring.variants.edges.map(e => `${e.node.title}: £${e.node.price}`).join(", "));
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
